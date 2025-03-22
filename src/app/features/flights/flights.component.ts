import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

interface Flight {
  id: number;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  type: string;
  stops: number;
  availableSeats: number;
}

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.scss']
})
export class FlightsComponent implements OnInit {
  searchForm: FormGroup;
  isLoading = false;
  hasSearched = false;
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  
  // For filters
  priceRange = { min: 0, max: 5000000 };
  selectedAirlines: string[] = [];
  airlines: {name: string, count: number}[] = [];
  
  // Sort options
  sortOptions = [
    { value: 'price_asc', label: 'Giá: Thấp đến cao' },
    { value: 'price_desc', label: 'Giá: Cao đến thấp' },
    { value: 'duration_asc', label: 'Thời gian bay: Ngắn nhất' },
    { value: 'departure_asc', label: 'Giờ khởi hành: Sớm nhất' },
    { value: 'departure_desc', label: 'Giờ khởi hành: Muộn nhất' },
  ];
  selectedSort = 'price_asc';

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      tripType: ['roundtrip', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departDate: ['', Validators.required],
      returnDate: [''],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
      cabinClass: ['economy', Validators.required]
    });
    
    // Set return date validator based on trip type
    this.searchForm.get('tripType')?.valueChanges.subscribe(type => {
      const returnDateControl = this.searchForm.get('returnDate');
      if (type === 'roundtrip') {
        returnDateControl?.setValidators(Validators.required);
      } else {
        returnDateControl?.clearValidators();
      }
      returnDateControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Set today as the minimum date for departure
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates as YYYY-MM-DD for input[type="date"]
    const todayFormatted = today.toISOString().split('T')[0];
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    this.searchForm.get('departDate')?.setValue(todayFormatted);
    this.searchForm.get('returnDate')?.setValue(tomorrowFormatted);
    
    // Mock data for testing
    this.mockFlights();
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      // Mark fields as touched to trigger validation messages
      Object.keys(this.searchForm.controls).forEach(key => {
        this.searchForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    
    // In a real app, we would call the API here
    setTimeout(() => {
      this.flights = this.getFilteredFlights();
      this.filteredFlights = [...this.flights];
      this.extractAirlines();
      this.hasSearched = true;
      this.isLoading = false;
    }, 1000);
  }

  getFilteredFlights(): Flight[] {
    const searchParams = this.searchForm.value;
    
    // In a real app, this would be filtered by the API
    // Here we're simulating a search with the mock data
    return this.mockFlightData.filter(flight => {
      return flight.from.toLowerCase().includes(searchParams.origin.toLowerCase()) &&
             flight.to.toLowerCase().includes(searchParams.destination.toLowerCase());
    });
  }

  filterFlights(): void {
    // Apply filters
    this.filteredFlights = this.flights.filter(flight => {
      // Price filter
      if (flight.price < this.priceRange.min || flight.price > this.priceRange.max) {
        return false;
      }
      
      // Airline filter
      if (this.selectedAirlines.length > 0 && !this.selectedAirlines.includes(flight.airline)) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting
    this.sortFlights();
  }

  sortFlights(): void {
    switch (this.selectedSort) {
      case 'price_asc':
        this.filteredFlights.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        this.filteredFlights.sort((a, b) => b.price - a.price);
        break;
      case 'duration_asc':
        this.filteredFlights.sort((a, b) => {
          const durationA = this.getDurationMinutes(a.duration);
          const durationB = this.getDurationMinutes(b.duration);
          return durationA - durationB;
        });
        break;
      case 'departure_asc':
        this.filteredFlights.sort((a, b) => {
          return a.departureTime.localeCompare(b.departureTime);
        });
        break;
      case 'departure_desc':
        this.filteredFlights.sort((a, b) => {
          return b.departureTime.localeCompare(a.departureTime);
        });
        break;
    }
  }

  onSortChange(event: Event): void {
    this.selectedSort = (event.target as HTMLSelectElement).value;
    this.sortFlights();
  }

  toggleAirlineFilter(airline: string): void {
    const index = this.selectedAirlines.indexOf(airline);
    if (index === -1) {
      this.selectedAirlines.push(airline);
    } else {
      this.selectedAirlines.splice(index, 1);
    }
    this.filterFlights();
  }

  resetFilters(): void {
    this.priceRange = { min: 0, max: 5000000 };
    this.selectedAirlines = [];
    this.filteredFlights = [...this.flights];
    this.selectedSort = 'price_asc';
    this.sortFlights();
  }

  extractAirlines(): void {
    const airlineMap = new Map<string, number>();
    
    this.flights.forEach(flight => {
      const count = airlineMap.get(flight.airline) || 0;
      airlineMap.set(flight.airline, count + 1);
    });
    
    this.airlines = Array.from(airlineMap).map(([name, count]) => ({ name, count }));
  }

  // Helper functions
  formatCurrency(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  getDurationMinutes(duration: string): number {
    // Assuming duration format is "Xh Ym" (e.g., "2h 30m")
    const hours = parseInt(duration.split('h')[0], 10);
    const minutes = parseInt(duration.split('h')[1]?.split('m')[0]?.trim() || '0', 10);
    return hours * 60 + minutes;
  }

  // Mock data
  mockFlightData: Flight[] = [];
  
  mockFlights(): void {
    const airlines = [
      { name: 'Vietnam Airlines', code: 'VN' },
      { name: 'VietJet Air', code: 'VJ' },
      { name: 'Bamboo Airways', code: 'QH' },
      { name: 'Pacific Airlines', code: 'BL' }
    ];
    
    const routes = [
      { from: 'Hà Nội', to: 'Hồ Chí Minh' },
      { from: 'Hồ Chí Minh', to: 'Đà Nẵng' },
      { from: 'Hà Nội', to: 'Đà Nẵng' },
      { from: 'Hồ Chí Minh', to: 'Phú Quốc' },
      { from: 'Hà Nội', to: 'Nha Trang' }
    ];
    
    const types = ['economy', 'business', 'premium'];
    
    // Generate flights
    for (let i = 1; i <= 50; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const route = routes[Math.floor(Math.random() * routes.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const stops = Math.floor(Math.random() * 3);
      
      // Generate random departure time
      const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minute = (Math.floor(Math.random() * 12) * 5).toString().padStart(2, '0');
      const departureTime = `${hour}:${minute}`;
      
      // Generate random duration
      const durationHours = 1 + Math.floor(Math.random() * 4);
      const durationMinutes = Math.floor(Math.random() * 12) * 5;
      const duration = `${durationHours}h ${durationMinutes}m`;
      
      // Calculate arrival time
      const deptHour = parseInt(hour, 10);
      const deptMinute = parseInt(minute, 10);
      let arrHour = (deptHour + durationHours) % 24;
      let arrMinute = (deptMinute + durationMinutes) % 60;
      if (deptMinute + durationMinutes >= 60) arrHour = (arrHour + 1) % 24;
      const arrivalTime = `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`;
      
      // Generate random price based on type and stops
      let basePrice = 800000 + Math.floor(Math.random() * 1000000);
      if (type === 'business') basePrice *= 2;
      if (type === 'premium') basePrice *= 1.5;
      if (stops === 0) basePrice *= 1.2;
      
      this.mockFlightData.push({
        id: i,
        airline: airline.name,
        airlineCode: airline.code,
        flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 900)}`,
        from: route.from,
        to: route.to,
        departureTime,
        arrivalTime,
        duration,
        price: Math.round(basePrice / 1000) * 1000, // Round to nearest 1000
        type,
        stops,
        availableSeats: 5 + Math.floor(Math.random() * 50)
      });
    }
  }
} 