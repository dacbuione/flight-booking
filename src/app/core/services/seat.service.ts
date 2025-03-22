import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { SeatMap, Seat, SeatSelectionRequest, SeatType } from '../models/seat.model';
import { environment } from '../../../environments/environment';
import { FlightClassType } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private readonly apiUrl = `${environment.apiUrl}/seats`;

  // Mock data for development
  private mockSeatMap: SeatMap = {
    flightId: '1',
    aircraft: {
      id: 'a1',
      model: 'Boeing 787-9',
      manufacturer: 'Boeing',
      maxRows: 45,
      maxColumns: 9,
      sections: [
        {
          id: 's1',
          name: 'Business Class',
          flightClass: FlightClassType.BUSINESS,
          startRow: 1,
          endRow: 5,
          columns: ['A', 'B', 'C', 'D', 'E', 'F']
        },
        {
          id: 's2',
          name: 'Premium Economy',
          flightClass: FlightClassType.PREMIUM_ECONOMY,
          startRow: 10,
          endRow: 15,
          columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']
        },
        {
          id: 's3',
          name: 'Economy Class',
          flightClass: FlightClassType.ECONOMY,
          startRow: 20,
          endRow: 45,
          columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']
        }
      ]
    },
    seats: this.generateMockSeats('1'),
    sections: [
      {
        id: 's1',
        name: 'Business Class',
        flightClass: FlightClassType.BUSINESS,
        startRow: 1,
        endRow: 5,
        columns: ['A', 'B', 'C', 'D', 'E', 'F']
      },
      {
        id: 's2',
        name: 'Premium Economy',
        flightClass: FlightClassType.PREMIUM_ECONOMY,
        startRow: 10,
        endRow: 15,
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']
      },
      {
        id: 's3',
        name: 'Economy Class',
        flightClass: FlightClassType.ECONOMY,
        startRow: 20,
        endRow: 45,
        columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']
      }
    ],
    legends: [
      { type: SeatType.REGULAR, label: 'Standard Seat', description: 'Regular seat with standard legroom' },
      { type: SeatType.EXIT_ROW, label: 'Exit Row', description: 'Seat located at emergency exit with extra legroom' },
      { type: SeatType.PREMIUM, label: 'Premium Seat', description: 'Premium seat with enhanced service' },
      { type: SeatType.EXTRA_LEGROOM, label: 'Extra Legroom', description: 'Seat with additional legroom' },
      { type: SeatType.BASSINET, label: 'Bassinet', description: 'Seat suitable for passengers with infants' },
      { type: SeatType.UNAVAILABLE, label: 'Unavailable', description: 'Seat not available for selection' }
    ]
  };

  constructor(private http: HttpClient) { }

  /**
   * Get seat map for a specific flight
   */
  getSeatMap(flightId: string): Observable<SeatMap> {
    // In production, this would be:
    // return this.http.get<SeatMap>(`${this.apiUrl}/flights/${flightId}/seat-map`);
    
    return of(this.mockSeatMap).pipe(delay(800));
  }

  /**
   * Reserve seats for a booking
   */
  reserveSeats(request: SeatSelectionRequest): Observable<boolean> {
    // In production, this would be:
    // return this.http.post<boolean>(`${this.apiUrl}/reserve`, request);
    
    return of(true).pipe(delay(1000));
  }

  /**
   * Get available seats for a specific flight class
   */
  getAvailableSeats(flightId: string, flightClass: FlightClassType): Observable<Seat[]> {
    // In production, this would be:
    // return this.http.get<Seat[]>(`${this.apiUrl}/flights/${flightId}/available-seats?class=${flightClass}`);
    
    // Filter mock seats by flight class and availability
    const availableSeats = this.mockSeatMap.seats.filter(
      seat => seat.flightClass === flightClass && seat.isAvailable
    );
    
    return of(availableSeats).pipe(delay(500));
  }

  /**
   * Generate mock seats for development
   */
  private generateMockSeats(flightId: string): Seat[] {
    const seats: Seat[] = [];
    
    // Business Class (rows 1-5)
    for (let row = 1; row <= 5; row++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        seats.push(this.createSeat(flightId, row, col, FlightClassType.BUSINESS));
      }
    }
    
    // Premium Economy (rows 10-15)
    for (let row = 10; row <= 15; row++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']) {
        seats.push(this.createSeat(flightId, row, col, FlightClassType.PREMIUM_ECONOMY));
      }
    }
    
    // Economy (rows 20-45)
    for (let row = 20; row <= 45; row++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']) {
        seats.push(this.createSeat(flightId, row, col, FlightClassType.ECONOMY));
      }
    }
    
    return seats;
  }

  /**
   * Create a single mock seat
   */
  private createSeat(flightId: string, row: number, column: string, flightClass: FlightClassType): Seat {
    const seatNumber = `${row}${column}`;
    const id = `${flightId}-${seatNumber}`;
    
    // Determine seat type
    let type = SeatType.REGULAR;
    let price = 0;
    let isAvailable = Math.random() > 0.2; // 80% of seats are available
    
    // Exit rows (typically rows 12 and 30 in this mock layout)
    if (row === 12 || row === 30) {
      type = SeatType.EXIT_ROW;
      price = flightClass === FlightClassType.ECONOMY ? 150000 : 0;
    } 
    // Extra legroom (first row in each section)
    else if (row === 1 || row === 10 || row === 20) {
      type = SeatType.EXTRA_LEGROOM;
      price = flightClass === FlightClassType.ECONOMY ? 100000 : 
              flightClass === FlightClassType.PREMIUM_ECONOMY ? 50000 : 0;
    }
    // Bassinet seats (typically in the first row of economy)
    else if (row === 20 && (column === 'D' || column === 'E' || column === 'F')) {
      type = SeatType.BASSINET;
      price = 0;
    }
    // Premium seats (window and aisle in economy)
    else if (flightClass === FlightClassType.ECONOMY && 
            (column === 'A' || column === 'J' || column === 'C' || column === 'G')) {
      type = SeatType.PREMIUM;
      price = 50000;
    }
    
    // Randomly mark some seats as unavailable
    if (Math.random() < 0.1) {
      isAvailable = false;
      type = SeatType.UNAVAILABLE;
    }
    
    return {
      id,
      flightId,
      row,
      column,
      seatNumber,
      type,
      price,
      currency: 'VND',
      isAvailable,
      isExit: type === SeatType.EXIT_ROW,
      isLegRoom: type === SeatType.EXTRA_LEGROOM,
      flightClass
    };
  }
} 