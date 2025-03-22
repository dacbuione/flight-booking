import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Airport } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  // Mock data for airports
  private airports: Airport[] = [
    { id: '1', code: 'HAN', name: 'Noi Bai International Airport', city: 'Hà Nội', country: 'Việt Nam' },
    { id: '2', code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Hồ Chí Minh', country: 'Việt Nam' },
    { id: '3', code: 'DAD', name: 'Da Nang International Airport', city: 'Đà Nẵng', country: 'Việt Nam' },
    { id: '4', code: 'CXR', name: 'Cam Ranh International Airport', city: 'Nha Trang', country: 'Việt Nam' },
    { id: '5', code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phú Quốc', country: 'Việt Nam' },
    { id: '6', code: 'HPH', name: 'Cat Bi International Airport', city: 'Hải Phòng', country: 'Việt Nam' },
    { id: '7', code: 'UIH', name: 'Phu Cat Airport', city: 'Quy Nhơn', country: 'Việt Nam' },
    { id: '8', code: 'VII', name: 'Vinh Airport', city: 'Vinh', country: 'Việt Nam' },
    { id: '9', code: 'HUI', name: 'Phu Bai International Airport', city: 'Huế', country: 'Việt Nam' },
    { id: '10', code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thái Lan' },
    { id: '11', code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thái Lan' },
    { id: '12', code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
    { id: '13', code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
    { id: '14', code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'Hàn Quốc' },
    { id: '15', code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Nhật Bản' },
    { id: '16', code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Nhật Bản' },
    { id: '17', code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Thượng Hải', country: 'Trung Quốc' },
    { id: '18', code: 'PEK', name: 'Beijing Capital International Airport', city: 'Bắc Kinh', country: 'Trung Quốc' }
  ];

  getAllAirports(): Observable<Airport[]> {
    return of(this.airports).pipe(delay(300));
  }

  searchAirports(query: string): Observable<Airport[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const normalizedQuery = query.toLowerCase();
    const results = this.airports.filter(airport => 
      airport.name.toLowerCase().includes(normalizedQuery) ||
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.code.toLowerCase().includes(normalizedQuery) ||
      airport.country.toLowerCase().includes(normalizedQuery)
    );

    return of(results).pipe(delay(300));
  }

  getAirportByCode(code: string): Observable<Airport | undefined> {
    const airport = this.airports.find(airport => airport.code === code);
    return of(airport).pipe(delay(200));
  }

  getPopularAirports(): Observable<Airport[]> {
    // Return top 8 popular airports
    return of(this.airports.slice(0, 8)).pipe(delay(300));
  }

  getAirportsByCodes(codes: string[]): Observable<Airport[]> {
    const airports = this.airports.filter(airport => codes.includes(airport.code));
    return of(airports).pipe(delay(300));
  }
} 