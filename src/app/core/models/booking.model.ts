import { Flight } from './flight.model';

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  flights: Flight[];
  passengers: Passenger[];
  contactInfo: ContactInfo;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Passenger {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  nationality?: string;
  specialRequests?: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PassengerType {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
  INFANT = 'INFANT'
} 