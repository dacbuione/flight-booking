import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { Booking, BookingStatus, ContactInfo, Passenger, PaymentStatus } from '../models/booking.model';
import { Flight } from '../models/flight.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bookings`;

  // Temporary mock bookings for demo
  private mockBookings: Booking[] = [
    {
      id: '1',
      bookingReference: 'BK12345',
      userId: '1',
      flights: [],
      passengers: [],
      contactInfo: {
        email: 'user@example.com',
        phone: '+84987654321'
      },
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      totalPrice: 2400000,
      currency: 'VND',
      createdAt: '2023-06-10T10:30:00',
      updatedAt: '2023-06-10T10:35:00'
    }
  ];

  getBookingsByUserId(userId: string): Observable<Booking[]> {
    // In a real app, this would be an API call
    return of(this.mockBookings).pipe(delay(800));
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    // In a real app, this would be an API call
    const booking = this.mockBookings.find(b => b.id === id);
    return of(booking).pipe(delay(500));
  }

  createBooking(
    flights: Flight[],
    passengers: Passenger[],
    contactInfo: ContactInfo,
    userId?: string
  ): Observable<Booking> {
    // In a real app, this would be an API call
    const newBooking: Booking = {
      id: (this.mockBookings.length + 1).toString(),
      bookingReference: `BK${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userId || 'guest',
      flights,
      passengers,
      contactInfo,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalPrice: flights.reduce((total, flight) => total + flight.price.amount, 0) * passengers.length,
      currency: 'VND',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockBookings.push(newBooking);
    return of(newBooking).pipe(delay(1000));
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking | undefined> {
    // In a real app, this would be an API call
    const bookingIndex = this.mockBookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return of(undefined);
    }

    this.mockBookings[bookingIndex] = {
      ...this.mockBookings[bookingIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    return of(this.mockBookings[bookingIndex]).pipe(delay(500));
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Observable<Booking | undefined> {
    // In a real app, this would be an API call
    const bookingIndex = this.mockBookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return of(undefined);
    }

    // If payment is successful, update booking status
    let bookingStatus = this.mockBookings[bookingIndex].status;
    if (paymentStatus === PaymentStatus.PAID && bookingStatus === BookingStatus.PENDING) {
      bookingStatus = BookingStatus.CONFIRMED;
    }

    this.mockBookings[bookingIndex] = {
      ...this.mockBookings[bookingIndex],
      paymentStatus,
      status: bookingStatus,
      updatedAt: new Date().toISOString()
    };

    return of(this.mockBookings[bookingIndex]).pipe(delay(500));
  }

  cancelBooking(id: string): Observable<Booking | undefined> {
    // In a real app, this would be an API call
    return this.updateBookingStatus(id, BookingStatus.CANCELLED);
  }
} 