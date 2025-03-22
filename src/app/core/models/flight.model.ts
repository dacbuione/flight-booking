export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minutes
  price: Price;
  availableSeats: number;
  flightClass: FlightClass[];
  stopOvers?: {
    airport: Airport;
    duration: number; // in minutes
  }[];
}

export interface Airline {
  id: string;
  name: string;
  code: string;
  logo: string;
}

export interface Airport {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
}

export interface Price {
  amount: number;
  currency: string;
  taxIncluded: boolean;
}

export enum FlightClassType {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export interface FlightClass {
  type: FlightClassType;
  price: Price;
  availableSeats: number;
  amenities?: string[];
}

export interface FlightSearchCriteria {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  flightClass: FlightClassType;
} 