import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface Flight {
  id: string;
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  departureAirport: {
    code: string;
    name: string;
    city: string;
  };
  arrivalAirport: {
    code: string;
    name: string;
    city: string;
  };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  direct: boolean;
  stops: {
    airport: string;
    durationMinutes: number;
  }[];
  flightNumber: string;
  aircraft: string;
  availableSeats: number;
  cabinClass: string;
}

interface FilterOptions {
  airlines: {
    code: string;
    name: string;
    count: number;
  }[];
  stops: {
    count: number;
    label: string;
    value: number;
  }[];
  cabinClasses: string[];
  priceRange: {
    min: number;
    max: number;
  };
  departureTimeRanges: {
    label: string;
    start: string;
    end: string;
    count: number;
  }[];
}

@Component({
  selector: 'app-flight-listing',
  templateUrl: './flight-listing.component.html',
  styleUrls: ['./flight-listing.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class FlightListingComponent implements OnInit {
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  filterOptions: FilterOptions = {
    airlines: [],
    stops: [],
    cabinClasses: [],
    priceRange: { min: 0, max: 0 },
    departureTimeRanges: [],
  };

  isLoading = true;
  hasError = false;
  errorMessage = '';
  sortOption = 'price';
  filterForm!: FormGroup;
  searchParams: any = {};

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchParams = {
        origin: params['origin'],
        destination: params['destination'],
        departDate: params['departDate'],
        returnDate: params['returnDate'],
        passengers: {
          adults: parseInt(params['adults'] || '1', 10),
          children: parseInt(params['children'] || '0', 10),
          infants: parseInt(params['infants'] || '0', 10),
        },
        cabinClass: params['cabinClass'] || 'economy',
        tripType: params['tripType'] || 'roundTrip',
      };

      this.initFilterForm();
      this.loadFlights();
    });
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      airlines: [[]],
      stops: [[]],
      minPrice: [null],
      maxPrice: [null],
      departureTimeRanges: [[]],
      returnTimeRanges: [[]],
      cabinClasses: [[]],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadFlights(): void {
    this.isLoading = true;
    // In a real app, this would be an API call
    setTimeout(() => {
      this.flights = this.getMockFlights();
      this.filteredFlights = [...this.flights];
      this.totalItems = this.flights.length;
      this.buildFilterOptions();
      this.isLoading = false;
    }, 1000);
  }

  buildFilterOptions(): void {
    // Build airline filter options
    const airlines = new Map();
    this.flights.forEach((flight) => {
      const { code, name } = flight.airline;
      if (!airlines.has(code)) {
        airlines.set(code, { code, name, count: 0 });
      }
      airlines.get(code).count++;
    });
    this.filterOptions.airlines = Array.from(airlines.values());

    // Build stops filter options
    const stopsMap = new Map();
    this.flights.forEach((flight) => {
      const stopCount = flight.stops.length;
      const key = stopCount.toString();
      if (!stopsMap.has(key)) {
        const label = stopCount === 0 ? 'Bay thẳng' : `${stopCount} điểm dừng`;
        stopsMap.set(key, { count: 0, label, value: stopCount });
      }
      stopsMap.get(key).count++;
    });
    this.filterOptions.stops = Array.from(stopsMap.values());

    // Build cabin class filter options
    const cabinClasses = new Set<string>();
    this.flights.forEach((flight) => {
      cabinClasses.add(flight.cabinClass);
    });
    this.filterOptions.cabinClasses = Array.from(cabinClasses);

    // Build price range
    const prices = this.flights.map((flight) => flight.price);
    this.filterOptions.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    // Build departure time ranges
    const timeRanges = [
      {
        label: 'Sáng sớm (00:00 - 05:59)',
        start: '00:00',
        end: '05:59',
        count: 0,
      },
      {
        label: 'Buổi sáng (06:00 - 11:59)',
        start: '06:00',
        end: '11:59',
        count: 0,
      },
      {
        label: 'Buổi chiều (12:00 - 17:59)',
        start: '12:00',
        end: '17:59',
        count: 0,
      },
      {
        label: 'Buổi tối (18:00 - 23:59)',
        start: '18:00',
        end: '23:59',
        count: 0,
      },
    ];

    this.flights.forEach((flight) => {
      const departureHour = parseInt(flight.departureTime.split(':')[0], 10);

      if (departureHour >= 0 && departureHour < 6) {
        timeRanges[0].count++;
      } else if (departureHour >= 6 && departureHour < 12) {
        timeRanges[1].count++;
      } else if (departureHour >= 12 && departureHour < 18) {
        timeRanges[2].count++;
      } else {
        timeRanges[3].count++;
      }
    });

    this.filterOptions.departureTimeRanges = timeRanges;
  }

  applyFilters(): void {
    if (!this.filterForm) return;

    const filters = this.filterForm.value;

    this.filteredFlights = this.flights.filter((flight) => {
      // Airline filter
      if (
        filters.airlines.length > 0 &&
        !filters.airlines.includes(flight.airline.code)
      ) {
        return false;
      }

      // Stops filter
      if (
        filters.stops.length > 0 &&
        !filters.stops.includes(flight.stops.length)
      ) {
        return false;
      }

      // Price filter
      if (filters.minPrice && flight.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice && flight.price > filters.maxPrice) {
        return false;
      }

      // Cabin class filter
      if (
        filters.cabinClasses.length > 0 &&
        !filters.cabinClasses.includes(flight.cabinClass)
      ) {
        return false;
      }

      // Departure time filter
      if (filters.departureTimeRanges.length > 0) {
        const departureHour = parseInt(flight.departureTime.split(':')[0], 10);
        const inRange = filters.departureTimeRanges.some((range: any) => {
          if (range === 'early-morning') {
            return departureHour >= 0 && departureHour < 6;
          } else if (range === 'morning') {
            return departureHour >= 6 && departureHour < 12;
          } else if (range === 'afternoon') {
            return departureHour >= 12 && departureHour < 18;
          } else if (range === 'evening') {
            return departureHour >= 18 && departureHour < 24;
          }
          return false;
        });

        if (!inRange) {
          return false;
        }
      }

      return true;
    });

    this.totalItems = this.filteredFlights.length;
    this.currentPage = 1;

    this.sortFlights();
  }

  sortFlights(): void {
    switch (this.sortOption) {
      case 'price':
        this.filteredFlights.sort((a, b) => a.price - b.price);
        break;
      case 'duration':
        this.filteredFlights.sort((a, b) => {
          const durationA = this.getDurationMinutes(a.duration);
          const durationB = this.getDurationMinutes(b.duration);
          return durationA - durationB;
        });
        break;
      case 'departure':
        this.filteredFlights.sort((a, b) => {
          const timeA = this.getTimeInMinutes(a.departureTime);
          const timeB = this.getTimeInMinutes(b.departureTime);
          return timeA - timeB;
        });
        break;
      case 'arrival':
        this.filteredFlights.sort((a, b) => {
          const timeA = this.getTimeInMinutes(a.arrivalTime);
          const timeB = this.getTimeInMinutes(b.arrivalTime);
          return timeA - timeB;
        });
        break;
    }
  }

  getDurationMinutes(duration: string): number {
    const parts = duration.split('h ');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1].replace('m', ''), 10);
    return hours * 60 + minutes;
  }

  getTimeInMinutes(time: string): number {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }

  setSortOption(option: string): void {
    this.sortOption = option;
    this.sortFlights();
  }

  getPageItems(): Flight[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFlights.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  selectFlight(flight: Flight): void {
    // Navigate to flight details/booking page
    this.router.navigate(['/booking'], {
      queryParams: {
        ...this.searchParams,
        flightId: flight.id,
      },
    });
  }

  // Mock data method
  private getMockFlights(): Flight[] {
    return [
      {
        id: '1',
        airline: {
          code: 'VN',
          name: 'Vietnam Airlines',
          logo: 'https://cdn.datacom.vn/images/banner/TEMP3/aubdpft3.png',
        },
        departureAirport: {
          code: 'HAN',
          name: 'Nội Bài',
          city: 'Hà Nội',
        },
        arrivalAirport: {
          code: 'SGN',
          name: 'Tân Sơn Nhất',
          city: 'Hồ Chí Minh',
        },
        departureTime: '07:30',
        arrivalTime: '09:40',
        duration: '2h 10m',
        price: 1290000,
        direct: true,
        stops: [],
        flightNumber: 'VN123',
        aircraft: 'Airbus A321',
        availableSeats: 42,
        cabinClass: 'economy',
      },
      {
        id: '2',
        airline: {
          code: 'VJ',
          name: 'Vietjet Air',
          logo: 'https://cdn.datacom.vn/images/banner/TEMP3/zv1x0c05.png',
        },
        departureAirport: {
          code: 'HAN',
          name: 'Nội Bài',
          city: 'Hà Nội',
        },
        arrivalAirport: {
          code: 'SGN',
          name: 'Tân Sơn Nhất',
          city: 'Hồ Chí Minh',
        },
        departureTime: '10:15',
        arrivalTime: '12:25',
        duration: '2h 10m',
        price: 950000,
        direct: true,
        stops: [],
        flightNumber: 'VJ456',
        aircraft: 'Airbus A320',
        availableSeats: 28,
        cabinClass: 'economy',
      },
      {
        id: '3',
        airline: {
          code: 'QH',
          name: 'Bamboo Airways',
          logo: 'https://cdn.datacom.vn/images/banner/TEMP3/wwfyftdo.png',
        },
        departureAirport: {
          code: 'HAN',
          name: 'Nội Bài',
          city: 'Hà Nội',
        },
        arrivalAirport: {
          code: 'SGN',
          name: 'Tân Sơn Nhất',
          city: 'Hồ Chí Minh',
        },
        departureTime: '14:45',
        arrivalTime: '16:55',
        duration: '2h 10m',
        price: 1150000,
        direct: true,
        stops: [],
        flightNumber: 'QH789',
        aircraft: 'Boeing 787',
        availableSeats: 36,
        cabinClass: 'economy',
      },
      {
        id: '4',
        airline: {
          code: 'VN',
          name: 'Vietnam Airlines',
          logo: 'https://cdn.datacom.vn/images/banner/TEMP3/aubdpft3.png',
        },
        departureAirport: {
          code: 'HAN',
          name: 'Nội Bài',
          city: 'Hà Nội',
        },
        arrivalAirport: {
          code: 'SGN',
          name: 'Tân Sơn Nhất',
          city: 'Hồ Chí Minh',
        },
        departureTime: '17:30',
        arrivalTime: '21:00',
        duration: '3h 30m',
        price: 1190000,
        direct: false,
        stops: [
          {
            airport: 'DAD',
            durationMinutes: 45,
          },
        ],
        flightNumber: 'VN245',
        aircraft: 'Airbus A321',
        availableSeats: 15,
        cabinClass: 'economy',
      },
      {
        id: '5',
        airline: {
          code: 'VJ',
          name: 'Vietjet Air',
          logo: 'https://cdn.datacom.vn/images/banner/TEMP3/zv1x0c05.png',
        },
        departureAirport: {
          code: 'HAN',
          name: 'Nội Bài',
          city: 'Hà Nội',
        },
        arrivalAirport: {
          code: 'SGN',
          name: 'Tân Sơn Nhất',
          city: 'Hồ Chí Minh',
        },
        departureTime: '05:30',
        arrivalTime: '07:40',
        duration: '2h 10m',
        price: 850000,
        direct: true,
        stops: [],
        flightNumber: 'VJ111',
        aircraft: 'Airbus A320',
        availableSeats: 22,
        cabinClass: 'economy',
      },
    ];
  }
}
