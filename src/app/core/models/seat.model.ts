import { FlightClassType } from './flight.model';
import { PassengerType } from './booking.model';

export interface Seat {
  id: string;
  flightId: string;
  row: number;
  column: string; // A, B, C, D, E, F...
  seatNumber: string; // Combination of row and column, e.g., "12A"
  type: SeatType;
  price: number;
  currency: string;
  isAvailable: boolean;
  isExit: boolean;
  isLegRoom: boolean;
  flightClass: FlightClassType;
  assignedToPassengerId?: string;
}

export interface SeatMap {
  flightId: string;
  aircraft: Aircraft;
  seats: Seat[];
  sections: SeatSection[];
  legends: SeatLegend[];
}

export interface Aircraft {
  id: string;
  model: string;
  manufacturer: string;
  maxRows: number;
  maxColumns: number;
  sections: SeatSection[];
}

export interface SeatSection {
  id: string;
  name: string;
  flightClass: FlightClassType;
  startRow: number;
  endRow: number;
  columns: string[];
}

export interface SeatLegend {
  type: SeatType;
  label: string;
  icon?: string;
  description?: string;
}

export enum SeatType {
  REGULAR = 'REGULAR',
  EXIT_ROW = 'EXIT_ROW',
  PREMIUM = 'PREMIUM',
  EXTRA_LEGROOM = 'EXTRA_LEGROOM',
  BASSINET = 'BASSINET', // For infants
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface SeatSelectionRequest {
  flightId: string;
  bookingId: string;
  seats: {
    seatId: string;
    passengerId: string;
    passengerType: PassengerType;
  }[];
} 