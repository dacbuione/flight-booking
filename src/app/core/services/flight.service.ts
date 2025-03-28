import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  Flight,
  FlightSearchCriteria,
  Airport,
  FlightClassType,
} from '../models/flight.model';
import { ApiService } from './api.service';
import { getConfigEndpoint } from '../utils/api-utils';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private readonly endpoint = 'flights';

  // Temporary mock data - in production, this would come from the API
  private mockFlights: Flight[] = [
    {
      id: '1',
      flightNumber: 'VN123',
      airline: {
        id: '1',
        name: 'Vietnam Airlines',
        logo: 'assets/images/airlines/vietnam-airlines.png',
        code: 'VN',
      },
      departureAirport: {
        id: '1',
        code: 'HAN',
        name: 'Noi Bai International Airport',
        city: 'Hanoi',
        country: 'Vietnam',
      },
      arrivalAirport: {
        id: '2',
        code: 'SGN',
        name: 'Tan Son Nhat International Airport',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      },
      departureTime: '2023-06-15T08:00:00',
      arrivalTime: '2023-06-15T10:10:00',
      duration: 120,
      price: {
        amount: 1200000,
        currency: 'VND',
        taxIncluded: true,
      },
      availableSeats: 65,
      flightClass: [
        {
          type: FlightClassType.ECONOMY,
          price: {
            amount: 1200000,
            currency: 'VND',
            taxIncluded: true,
          },
          availableSeats: 45,
        },
        {
          type: FlightClassType.BUSINESS,
          price: {
            amount: 3500000,
            currency: 'VND',
            taxIncluded: true,
          },
          availableSeats: 20,
        },
      ],
    },
    {
      id: '2',
      flightNumber: 'VJ456',
      airline: {
        id: '2',
        name: 'Vietjet Air',
        logo: 'assets/images/airlines/vietjet.png',
        code: 'VJ',
      },
      departureAirport: {
        id: '1',
        code: 'HAN',
        name: 'Noi Bai International Airport',
        city: 'Hanoi',
        country: 'Vietnam',
      },
      arrivalAirport: {
        id: '2',
        code: 'SGN',
        name: 'Tan Son Nhat International Airport',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      },
      departureTime: '2023-06-15T09:30:00',
      arrivalTime: '2023-06-15T11:45:00',
      duration: 135,
      price: {
        amount: 850000,
        currency: 'VND',
        taxIncluded: true,
      },
      availableSeats: 80,
      flightClass: [
        {
          type: FlightClassType.ECONOMY,
          price: {
            amount: 850000,
            currency: 'VND',
            taxIncluded: true,
          },
          availableSeats: 80,
        },
      ],
    },
  ];

  // Mock data for development
  private mockAirports: Airport[] = [
    {
      id: '1',
      code: 'HAN',
      name: 'Nội Bài International Airport',
      city: 'Hà Nội',
      country: 'Việt Nam',
    },
    {
      id: '2',
      code: 'SGN',
      name: 'Tân Sơn Nhất International Airport',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
    },
    {
      id: '3',
      code: 'DAD',
      name: 'Đà Nẵng International Airport',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
    },
    {
      id: '4',
      code: 'CXR',
      name: 'Cam Ranh International Airport',
      city: 'Nha Trang',
      country: 'Việt Nam',
    },
    {
      id: '5',
      code: 'PQC',
      name: 'Phú Quốc International Airport',
      city: 'Phú Quốc',
      country: 'Việt Nam',
    },
    {
      id: '6',
      code: 'HUI',
      name: 'Phú Bài International Airport',
      city: 'Huế',
      country: 'Việt Nam',
    },
    {
      id: '7',
      code: 'BKK',
      name: 'Suvarnabhumi Airport',
      city: 'Bangkok',
      country: 'Thái Lan',
    },
    {
      id: '8',
      code: 'SIN',
      name: 'Changi Airport',
      city: 'Singapore',
      country: 'Singapore',
    },
    {
      id: '9',
      code: 'KUL',
      name: 'Kuala Lumpur International Airport',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
    },
    {
      id: '10',
      code: 'ICN',
      name: 'Incheon International Airport',
      city: 'Seoul',
      country: 'Hàn Quốc',
    },
  ];

  private mockPopularDestinations = [
    {
      code: 'BKK',
      city: 'Bangkok',
      country: 'Thái Lan',
      image: 'assets/images/destinations/bangkok.jpg',
    },
    {
      code: 'SGN',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
      image: 'assets/images/destinations/ho-chi-minh.jpg',
    },
    {
      code: 'DAD',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      image: 'assets/images/destinations/da-nang.jpg',
    },
    {
      code: 'SIN',
      city: 'Singapore',
      country: 'Singapore',
      image: 'assets/images/destinations/singapore.jpg',
    },
    {
      code: 'ICN',
      city: 'Seoul',
      country: 'Hàn Quốc',
      image: 'assets/images/destinations/seoul.jpg',
    },
    {
      code: 'PQC',
      city: 'Phú Quốc',
      country: 'Việt Nam',
      image: 'assets/images/destinations/phu-quoc.jpg',
    },
  ];

  constructor(
    private apiService: ApiService,
  ) {}

  /**
   * Get list of all airports
   * @returns Observable with array of airports
   */
  getAirports(): Observable<Airport[]> {
    // In a real app, we would call the API
    // return this.apiService.get<Airport[]>(getConfigEndpoint('flights', 'airports'));

    // For now, return mock data
    return of(this.mockAirports);
  }

  /**
   * Get popular destinations for homepage
   * @returns Observable with array of destination objects
   */
  getPopularDestinations(): Observable<any[]> {
    // In a real app, would call API
    // return this.apiService.get<any[]>(getConfigEndpoint('flights', 'popular'));

    // Return mock data
    return of(this.mockPopularDestinations);
  }

  /**
   * Search for flights based on criteria
   * @param criteria The search criteria
   * @returns Observable with array of matching flights
   */
  searchFlights(criteria: FlightSearchCriteria): Observable<Flight[]> {
    // In a real app, this would be an API call with the criteria
    // return this.apiService.post<Flight[]>(getConfigEndpoint('flights', 'search'), criteria);

    // For development, return empty array
    return of([]);
  }

  /**
   * Get details for a specific flight by ID
   * @param flightId The flight ID
   * @returns Observable with flight details
   */
  getFlightDetails(flightId: string): Observable<Flight> {
    // In a real app:
    // return this.apiService.get<Flight>(getConfigEndpoint('flights', 'details', { id: flightId }));

    // For development, return null
    return of({} as Flight);
  }

  getFlightById(id: string): Observable<Flight | undefined> {
    // In a real application, this would make an API call
    // return this.apiService.get<Flight>(getConfigEndpoint('flights', 'details', { id }));

    const flight = this.mockFlights.find((f) => f.id === id);
    return of(flight).pipe(delay(500));
  }

  /**
   * Get flight offers from shopping API
   * @param searchParams Search parameters for flight offers
   * @returns Observable with flight offers
   */
  getFlightOffers(searchParams: any): Observable<any> {
    // No need to manually set auth header as it's now automatically added by ApiService
    
    // Prepare the request payload based on search parameters
    const payload = {
      originDestinations: [
        {
          id: '1',
          originLocationCode: searchParams.origin,
          destinationLocationCode: searchParams.destination,
          departureDate: searchParams.departDate,
        },
      ],
      tripType: searchParams.tripType?.toUpperCase() === 'RETURN' ? 'RETURN' : 'ONE_WAY',
      travelerCount: {
        adult: parseInt(searchParams.passengers?.adults || 1, 10),
        child: parseInt(searchParams.passengers?.children || 0, 10),
        infant: parseInt(searchParams.passengers?.infants || 0, 10),
      },
      searchCriteria: {
        maxFlightOffers: 250,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: this.mapCabinClass(searchParams.cabinClass)
            }
          ]
        }
      },
      // Add providers to match the example request
      providers: ['VJ', 'VN', 'QH'] // Include all major Vietnamese airlines
    };

    // If it's a round trip, add return flight
    if (
      searchParams.returnDate &&
      searchParams.tripType?.toUpperCase() === 'RETURN'
    ) {
      payload.originDestinations.push({
        id: '2',
        originLocationCode: searchParams.destination,
        destinationLocationCode: searchParams.origin,
        departureDate: searchParams.returnDate,
      });
    }

    // The direct endpoint is 'flight/shopping/offers'
    return this.apiService.post<any>('flight/shopping/offers', payload);
  }

  /**
   * Maps cabin class from UI to API format
   * @param cabinClass The cabin class from UI
   * @returns The corresponding cabin class for API
   */
  private mapCabinClass(cabinClass: string): FlightClassType {
    switch (cabinClass?.toLowerCase()) {
      case 'business':
        return FlightClassType.BUSINESS;
      case 'first':
        return FlightClassType.FIRST;
      case 'premium_economy':
      case 'premium-economy':
      case 'premium economy':
        return FlightClassType.PREMIUM_ECONOMY;
      case 'economy':
      default:
        return FlightClassType.ECONOMY;
    }
  }
}
