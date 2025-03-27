import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlightService } from '../../core/services/flight.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
  fareOptions?: FareOption[];
  sessionKey?: string;
  provider?: string;
}

interface FareOption {
  fareType: string;
  totalPrice: number;
  availability: number;
  fareOptionId: string;
  currency: string;
  fares?: {
    travelerId: string;
    travelerType: string;
    price: {
      currency: string;
      base: number;
      taxes: {
        code: string;
        amount: number;
        description: string;
      }[];
      total: number;
    };
    fareDetailsBySegment: {
      itineraryId: string;
      segmentId: string;
      cabin: string;
      fareBasis: string;
      fareClassCode: string;
      includedCheckedBags?: {
        quantity: number;
        weight: number;
        weightUnit: string;
        details: string;
      };
      carryOnBags?: {
        quantity: number;
        weight: number;
        weightUnit: string;
        details: string;
      };
      privateFare: boolean;
      fareClass: string;
    }[];
  }[];
  fareDetailsBySegment?: {
    cabin: string;
    includedCheckedBags?: {
      quantity: number;
      weight: number;
      weightUnit: string;
      details: string;
    };
    carryOnBags?: {
      quantity: number;
      weight: number;
      weightUnit: string;
      details: string;
    };
  }[];
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

  // Add Math object for use in template
  Math = Math;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private flightService: FlightService
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

    // We don't need to subscribe to valueChanges anymore
    // since we're directly handling changes via the (change) event
  }

  loadFlights(): void {
    this.isLoading = true;
    this.hasError = false;

    this.flightService
      .getFlightOffers(this.searchParams)
      .pipe(
        catchError((error) => {
          this.hasError = true;
          this.errorMessage = 'Failed to load flights. Please try again later.';
          console.error('Error loading flights:', error);
          return of({ data: [] });
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        // Transform API response to match our Flight interface
        if (response && response.data && response.data.length > 0) {
          this.flights = this.transformFlightOffers(response.data);
          this.filteredFlights = [...this.flights];
          this.totalItems = this.flights.length;
          this.buildFilterOptions();
        } else if (
          response &&
          response.flightOffers &&
          response.flightOffers.length > 0
        ) {
          // Handle the actual API response format from booking1a
          this.flights = this.transformFlightOffers(response.flightOffers);
          this.filteredFlights = [...this.flights];
          this.totalItems = this.flights.length;
          this.buildFilterOptions();
        } else {
          this.flights = [];
          this.filteredFlights = [];
          this.totalItems = 0;
        }
      });
  }

  /**
   * Transform flight offers from API to match our Flight interface
   * @param flightOffers Flight offers from API
   * @returns Transformed Flight array
   */
  private transformFlightOffers(flightOffers: any[]): Flight[] {
    return flightOffers.map((offer, index) => {
      // Check if the offer follows the new API format
      if (offer.flightOfferId && offer.itineraries) {
        // New API format
        const flightId = offer.flightOfferId;
        const firstItinerary = offer.itineraries[0] || {};
        const segments = firstItinerary.segments || [];

        if (segments.length === 0) {
          console.warn('No segments found in flight offer', offer);
          return this.createEmptyFlight(index);
        }

        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        // Calculate stops
        const stops: { airport: string; durationMinutes: number }[] = [];
        if (segments.length > 1) {
          for (let i = 0; i < segments.length - 1; i++) {
            const currentSegment = segments[i];
            const nextSegment = segments[i + 1];

            stops.push({
              airport: currentSegment.arrival?.iataCode || 'N/A',
              durationMinutes: this.calculateStopDuration(
                currentSegment,
                nextSegment
              ),
            });
          }
        }

        // Get lowest price from fareOptions
        let lowestPrice = Number.MAX_VALUE;
        if (offer.fareOptions && offer.fareOptions.length > 0) {
          lowestPrice = Math.min(
            ...offer.fareOptions.map((fare: any) => fare.totalPrice)
          );
        }

        // Get first available cabin class and availability
        let cabinClass = 'economy';
        let availableSeats = 0;

        if (offer.fareOptions && offer.fareOptions.length > 0) {
          const firstFare = offer.fareOptions[0];
          if (
            firstFare.fares &&
            firstFare.fares.length > 0 &&
            firstFare.fares[0].fareDetailsBySegment &&
            firstFare.fares[0].fareDetailsBySegment.length > 0
          ) {
            cabinClass =
              firstFare.fares[0].fareDetailsBySegment[0].cabin?.toLowerCase() ||
              'economy';
          }
          availableSeats = firstFare.availability || 0;
        }

        // Calculate airline information
        const carrierCode =
          firstSegment.carrierCode ||
          offer.validatingAirlineCodes?.[0] ||
          'N/A';

        // Use predefined airline names based on codes
        const carrierName = this.getAirlineName(carrierCode);
        const logoUrl = this.getAirlineLogo(carrierCode);

        return {
          id: flightId,
          airline: {
            code: carrierCode,
            name: carrierName,
            logo: logoUrl,
          },
          departureAirport: {
            code: firstSegment.departure?.iataCode || 'N/A',
            name: this.getAirportName(firstSegment.departure?.iataCode),
            city: this.getAirportCity(firstSegment.departure?.iataCode),
          },
          arrivalAirport: {
            code: lastSegment.arrival?.iataCode || 'N/A',
            name: this.getAirportName(lastSegment.arrival?.iataCode),
            city: this.getAirportCity(lastSegment.arrival?.iataCode),
          },
          departureTime: this.formatTime(firstSegment.departure?.at),
          arrivalTime: this.formatTime(lastSegment.arrival?.at),
          duration: this.formatDuration(firstItinerary.duration),
          price: lowestPrice,
          direct: firstItinerary.numberOfStops === 0,
          stops: stops,
          flightNumber: `${carrierCode}${firstSegment.flightNumber}`,
          aircraft: firstSegment.aircraft?.code || 'N/A',
          availableSeats: availableSeats,
          cabinClass: cabinClass,
          fareOptions: offer.fareOptions,
          sessionKey: offer.sessionKey,
          provider: offer.provider,
        };
      } else {
        // Previous code to handle older API format
        const itineraries = offer.itineraries || [];
        const firstItinerary = itineraries[0] || {};
        const segments =
          firstItinerary.segments || offer.flight?.segments || [];

        if (segments.length === 0) {
          console.warn('No segments found in flight offer', offer);
          return this.createEmptyFlight(index);
        }

        const firstSegment = segments[0] || {};
        const lastSegment = segments[segments.length - 1] || {};

        // Calculate stops
        const stops: { airport: string; durationMinutes: number }[] = [];
        if (segments.length > 1) {
          for (let i = 0; i < segments.length - 1; i++) {
            const currentSegment = segments[i];
            const nextSegment = segments[i + 1];

            // Handle different response formats
            const arrivalCode =
              currentSegment.arrival?.iataCode ||
              currentSegment.destination?.iataCode ||
              'N/A';

            stops.push({
              airport: arrivalCode,
              durationMinutes: this.calculateStopDuration(
                currentSegment,
                nextSegment
              ),
            });
          }
        }

        // Handle different price formats
        const price =
          typeof offer.price === 'object'
            ? offer.price?.total || offer.price?.grandTotal
            : offer.price || 0;

        // Handle different carrier formats
        const carrierCode =
          firstSegment.carrierCode ||
          firstSegment.marketingCarrier?.code ||
          firstSegment.airline?.code ||
          'N/A';

        const carrierName =
          firstSegment.carrierName ||
          firstSegment.marketingCarrier?.name ||
          firstSegment.airline?.name ||
          this.getAirlineName(carrierCode);

        // Handle different departure formats
        const departureCode =
          firstSegment.departure?.iataCode ||
          firstSegment.origin?.iataCode ||
          'N/A';

        const departureName =
          firstSegment.departure?.airportName ||
          firstSegment.origin?.name ||
          this.getAirportName(departureCode);

        const departureCity =
          firstSegment.departure?.cityName ||
          firstSegment.origin?.city ||
          this.getAirportCity(departureCode);

        // Handle different arrival formats
        const arrivalCode =
          lastSegment.arrival?.iataCode ||
          lastSegment.destination?.iataCode ||
          'N/A';

        const arrivalName =
          lastSegment.arrival?.airportName ||
          lastSegment.destination?.name ||
          this.getAirportName(arrivalCode);

        const arrivalCity =
          lastSegment.arrival?.cityName ||
          lastSegment.destination?.city ||
          this.getAirportCity(arrivalCode);

        // Handle different duration formats
        const duration =
          firstItinerary.duration || offer.flight?.duration || 'PT0H';

        return {
          id: offer.id || String(index),
          airline: {
            code: carrierCode,
            name: carrierName,
            logo: this.getAirlineLogo(carrierCode),
          },
          departureAirport: {
            code: departureCode,
            name: departureName,
            city: departureCity,
          },
          arrivalAirport: {
            code: arrivalCode,
            name: arrivalName,
            city: arrivalCity,
          },
          departureTime: this.formatTime(
            firstSegment.departure?.at || firstSegment.departureTime
          ),
          arrivalTime: this.formatTime(
            lastSegment.arrival?.at || lastSegment.arrivalTime
          ),
          duration: this.formatDuration(duration),
          price: parseFloat(price),
          direct: segments.length === 1,
          stops: stops,
          flightNumber: `${carrierCode}${firstSegment.flightNumber || ''}`,
          aircraft:
            firstSegment.aircraft?.code || firstSegment.aircraftCode || 'N/A',
          availableSeats:
            offer.numberOfBookableSeats || offer.availableSeats || 9,
          cabinClass:
            offer.cabin ||
            firstItinerary.segments?.[0]?.cabin?.toLowerCase() ||
            'economy',
        };
      }
    });
  }

  /**
   * Create empty flight object when data is missing
   */
  private createEmptyFlight(index: number): Flight {
    return {
      id: String(index + 1),
      airline: {
        code: 'N/A',
        name: 'Unknown Airline',
        logo: 'https://cdn.datacom.vn/images/banner/TEMP3/default.png',
      },
      departureAirport: {
        code: 'N/A',
        name: 'Unknown Airport',
        city: 'Unknown City',
      },
      arrivalAirport: {
        code: 'N/A',
        name: 'Unknown Airport',
        city: 'Unknown City',
      },
      departureTime: '00:00',
      arrivalTime: '00:00',
      duration: '0h 0m',
      price: 0,
      direct: true,
      stops: [],
      flightNumber: 'N/A',
      aircraft: 'N/A',
      availableSeats: 0,
      cabinClass: 'economy',
    };
  }

  /**
   * Format ISO date to HH:MM format
   * @param isoDate ISO date string
   * @returns Formatted time string
   */
  private formatTime(isoDate: string): string {
    if (!isoDate) return '00:00';

    const date = new Date(isoDate);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Format duration from PT3H20M format to "3h 20m"
   * @param duration Duration in ISO format
   * @returns Formatted duration string
   */
  private formatDuration(duration: string): string {
    if (!duration) return '0h 0m';

    // Parse PT3H20M format
    const hourMatch = duration.match(/(\d+)H/);
    const minuteMatch = duration.match(/(\d+)M/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    return `${hours}h ${minutes}m`;
  }

  /**
   * Calculate duration between flight segments (for layovers)
   * @param segment1 First segment
   * @param segment2 Second segment
   * @returns Duration in minutes
   */
  private calculateStopDuration(segment1: any, segment2: any): number {
    if (!segment1.arrival?.at || !segment2.departure?.at) return 0;

    const arrivalTime = new Date(segment1.arrival.at).getTime();
    const departureTime = new Date(segment2.departure.at).getTime();

    return Math.floor((departureTime - arrivalTime) / (1000 * 60));
  }

  buildFilterOptions(): void {
    // Initialize counters
    const airlineCount: Record<string, number> = {};
    const stopsCount: Record<number, number> = {};
    const cabinClasses = new Set<string>();
    const fareTypes = new Set<string>();

    let minPrice = Number.MAX_VALUE;
    let maxPrice = 0;

    // Count occurrences of each filter value
    this.flights.forEach((flight) => {
      // Count airlines
      const airline = flight.airline.code;
      airlineCount[airline] = (airlineCount[airline] || 0) + 1;

      // Count number of stops
      const stops = flight.stops.length;
      stopsCount[stops] = (stopsCount[stops] || 0) + 1;

      // Track cabin classes
      cabinClasses.add(flight.cabinClass);

      // Track fare types from new API
      if (flight.fareOptions && flight.fareOptions.length > 0) {
        flight.fareOptions.forEach((fare) => {
          fareTypes.add(fare.fareType);
        });
      }

      // Track price range
      minPrice = Math.min(minPrice, flight.price);
      maxPrice = Math.max(maxPrice, flight.price);
    });

    // Format airlines for filter options
    const airlines = Object.keys(airlineCount).map((code) => ({
      code,
      name: this.getAirlineName(code),
      count: airlineCount[code],
    }));

    // Sort airlines alphabetically by name
    airlines.sort((a, b) => a.name.localeCompare(b.name));

    // Format stops count for filter options
    const stops = Object.keys(stopsCount)
      .map((stops) => parseInt(stops, 10))
      .sort((a, b) => a - b)
      .map((stops) => ({
        count: stopsCount[stops],
        label: stops === 0 ? 'Bay thẳng' : `${stops} điểm dừng`,
        value: stops,
      }));

    // Update filter options
    this.filterOptions.airlines = airlines;
    this.filterOptions.stops = stops;

    // For cabin classes, combine standard cabin classes with fare types without duplicates
    const cabinClassesArray = [...cabinClasses];
    const fareTypesArray = [...fareTypes];

    // Remove duplicates and normalize names
    this.filterOptions.cabinClasses = [
      ...new Set([
        ...cabinClassesArray.map((cabin) => cabin.toLowerCase()),
        ...fareTypesArray,
      ]),
    ];

    this.filterOptions.priceRange = {
      min: Math.floor(minPrice / 1000) * 1000, // Round down to nearest thousand
      max: Math.ceil(maxPrice / 1000) * 1000, // Round up to nearest thousand
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

    // Initialize form control values
    if (this.filterForm) {
      this.filterForm.patchValue({
        minPrice: this.filterOptions.priceRange.min,
        maxPrice: this.filterOptions.priceRange.max,
      });
    }
  }

  applyFilters(): void {
    if (!this.filterForm) return;

    const filters = this.filterForm.value;
    const selectedAirlines = this.getSelectedCheckboxValues('airline');
    const selectedStops = this.getSelectedCheckboxValues('stop').map((v) =>
      parseInt(v, 10)
    );
    const selectedCabins = this.getSelectedCheckboxValues('cabin');
    const selectedTimeRanges = this.getSelectedCheckboxValues('time');

    this.filteredFlights = this.flights.filter((flight) => {
      // Airline filter
      if (
        selectedAirlines.length > 0 &&
        !selectedAirlines.includes(flight.airline.code)
      ) {
        return false;
      }

      // Stops filter
      if (
        selectedStops.length > 0 &&
        !selectedStops.includes(flight.stops.length)
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
      if (selectedCabins.length > 0) {
        // Check standard cabin class
        const cabinMatches = selectedCabins.includes(
          flight.cabinClass.toLowerCase()
        );

        // Check fare options if available
        let fareTypeMatches = false;
        if (flight.fareOptions && flight.fareOptions.length > 0) {
          fareTypeMatches = flight.fareOptions.some((fare) =>
            selectedCabins.includes(fare.fareType)
          );
        }

        if (!cabinMatches && !fareTypeMatches) {
          return false;
        }
      }

      // Departure time filter
      if (selectedTimeRanges.length > 0) {
        const departureHour = parseInt(flight.departureTime.split(':')[0], 10);
        const inRange = selectedTimeRanges.some((range) => {
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

  // Helper method to get selected checkbox values
  getSelectedCheckboxValues(type: string): string[] {
    const checkboxes = document.querySelectorAll(
      `input[id^="${type}-"]:checked`
    );
    return Array.from(checkboxes).map(
      (checkbox) => (checkbox as HTMLInputElement).value
    );
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

  selectFlight(flight: Flight, fareOptionIndex: number = 0): void {
    // Get the selected fare option if available
    let fareParams = {};

    if (flight.fareOptions && flight.fareOptions.length > 0) {
      const selectedFare = flight.fareOptions[fareOptionIndex];

      fareParams = {
        fareOptionId: selectedFare.fareOptionId,
        fareType: selectedFare.fareType,
        totalPrice: selectedFare.totalPrice,
        currency: selectedFare.currency,
      };
    }

    // Navigate to flight details/booking page with all required parameters
    this.router.navigate(['/booking'], {
      queryParams: {
        ...this.searchParams,
        flightId: flight.id,
        provider: flight.provider,
        sessionKey: flight.sessionKey,
        ...fareParams,
      },
    });
  }

  // Helper methods for airline and airport information
  private getAirlineName(code: string): string {
    const airlines: Record<string, string> = {
      VJ: 'VietJet Air',
      VN: 'Vietnam Airlines',
      BL: 'Pacific Airlines',
      QH: 'Bamboo Airways',
      VU: 'Vietravel Airlines',
    };
    return airlines[code] || 'Unknown Airline';
  }

  private getAirlineLogo(code: string): string {
    return `assets/images/airlines/${code.toLowerCase()}.png`;
  }

  private getAirportName(code: string): string {
    const airports: Record<string, string> = {
      HAN: 'Nội Bài',
      SGN: 'Tân Sơn Nhất',
      DAD: 'Đà Nẵng',
      HUI: 'Phú Bài',
      CXR: 'Cam Ranh',
      DLI: 'Liên Khương',
      PQC: 'Phú Quốc',
    };
    return airports[code] || 'Unknown Airport';
  }

  private getAirportCity(code: string): string {
    const cities: Record<string, string> = {
      HAN: 'Hà Nội',
      SGN: 'Hồ Chí Minh',
      DAD: 'Đà Nẵng',
      HUI: 'Huế',
      CXR: 'Nha Trang',
      DLI: 'Đà Lạt',
      PQC: 'Phú Quốc',
    };
    return cities[code] || 'Unknown City';
  }
}
