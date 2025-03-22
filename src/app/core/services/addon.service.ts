import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Addon, AddonType, BaggageAddon, InsuranceAddon, MealAddon, MealType, DietaryOption, BookingAddons, PassengerAddonSelection } from '../models/addon.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddonService {
  private readonly apiUrl = `${environment.apiUrl}/addons`;

  // Mock data for development
  private mockBaggageAddons: BaggageAddon[] = [
    {
      id: 'bag1',
      type: AddonType.BAGGAGE,
      name: 'Hành lý 15kg',
      description: 'Hành lý ký gửi thêm 15kg',
      price: 250000,
      currency: 'VND',
      icon: 'luggage',
      isAvailable: true,
      weight: 15
    },
    {
      id: 'bag2',
      type: AddonType.BAGGAGE,
      name: 'Hành lý 20kg',
      description: 'Hành lý ký gửi thêm 20kg',
      price: 350000,
      currency: 'VND',
      icon: 'luggage',
      isAvailable: true,
      weight: 20
    },
    {
      id: 'bag3',
      type: AddonType.BAGGAGE,
      name: 'Hành lý 25kg',
      description: 'Hành lý ký gửi thêm 25kg',
      price: 450000,
      currency: 'VND',
      icon: 'luggage',
      isAvailable: true,
      weight: 25
    },
    {
      id: 'bag4',
      type: AddonType.BAGGAGE,
      name: 'Hành lý 30kg',
      description: 'Hành lý ký gửi thêm 30kg',
      price: 550000,
      currency: 'VND',
      icon: 'luggage',
      isAvailable: true,
      weight: 30
    }
  ];

  private mockMealAddons: MealAddon[] = [
    {
      id: 'meal1',
      type: AddonType.MEAL,
      name: 'Bữa ăn tiêu chuẩn',
      description: 'Bữa ăn nóng tiêu chuẩn với các món chính, món phụ và tráng miệng',
      price: 150000,
      currency: 'VND',
      icon: 'restaurant',
      isAvailable: true,
      mealType: MealType.STANDARD,
      dietaryOptions: [],
      isHotMeal: true
    },
    {
      id: 'meal2',
      type: AddonType.MEAL,
      name: 'Bữa ăn chay',
      description: 'Bữa ăn chay với rau củ tươi và đạm thực vật',
      price: 150000,
      currency: 'VND',
      icon: 'restaurant',
      isAvailable: true,
      mealType: MealType.VEGETARIAN,
      dietaryOptions: [DietaryOption.DAIRY_FREE],
      isHotMeal: true
    },
    {
      id: 'meal3',
      type: AddonType.MEAL,
      name: 'Bữa ăn Halal',
      description: 'Bữa ăn tuân thủ theo quy định Halal',
      price: 180000,
      currency: 'VND',
      icon: 'restaurant',
      isAvailable: true,
      mealType: MealType.HALAL,
      dietaryOptions: [],
      isHotMeal: true
    },
    {
      id: 'meal4',
      type: AddonType.MEAL,
      name: 'Bữa ăn trẻ em',
      description: 'Bữa ăn đặc biệt dành cho trẻ em với thực đơn phù hợp',
      price: 120000,
      currency: 'VND',
      icon: 'child_care',
      isAvailable: true,
      mealType: MealType.CHILD_MEAL,
      dietaryOptions: [],
      isHotMeal: true
    }
  ];

  private mockInsuranceAddons: InsuranceAddon[] = [
    {
      id: 'ins1',
      type: AddonType.INSURANCE,
      name: 'Bảo hiểm cơ bản',
      description: 'Bảo hiểm du lịch cơ bản bao gồm y tế và hành lý',
      price: 100000,
      currency: 'VND',
      icon: 'health_and_safety',
      isAvailable: true,
      coverageDetails: {
        medicalCoverage: 500000000,
        cancellationCoverage: 10000000,
        baggageCoverage: 20000000,
        delayCoverage: 5000000
      },
      provider: 'Bảo Việt',
      termsUrl: 'https://example.com/terms/basic-insurance'
    },
    {
      id: 'ins2',
      type: AddonType.INSURANCE,
      name: 'Bảo hiểm toàn diện',
      description: 'Bảo hiểm du lịch toàn diện với mức bồi thường cao hơn',
      price: 200000,
      currency: 'VND',
      icon: 'health_and_safety',
      isAvailable: true,
      coverageDetails: {
        medicalCoverage: 1000000000,
        cancellationCoverage: 20000000,
        baggageCoverage: 30000000,
        delayCoverage: 10000000
      },
      provider: 'Bảo Việt',
      termsUrl: 'https://example.com/terms/premium-insurance'
    }
  ];

  private mockOtherAddons: Addon[] = [
    {
      id: 'other1',
      type: AddonType.PRIORITY_BOARDING,
      name: 'Ưu tiên lên máy bay',
      description: 'Ưu tiên làm thủ tục và lên máy bay trước',
      price: 120000,
      currency: 'VND',
      icon: 'priority_high',
      isAvailable: true
    },
    {
      id: 'other2',
      type: AddonType.LOUNGE_ACCESS,
      name: 'Phòng chờ thương gia',
      description: 'Truy cập phòng chờ thương gia tại sân bay với đồ ăn và đồ uống miễn phí',
      price: 500000,
      currency: 'VND',
      icon: 'weekend',
      isAvailable: true
    },
    {
      id: 'other3',
      type: AddonType.WIFI,
      name: 'Wifi trên máy bay',
      description: 'Kết nối internet trong suốt chuyến bay',
      price: 150000,
      currency: 'VND',
      icon: 'wifi',
      isAvailable: true
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get all available addons for a specific flight
   */
  getAvailableAddons(flightId: string): Observable<Addon[]> {
    // In production, this would be:
    // return this.http.get<Addon[]>(`${this.apiUrl}/flights/${flightId}/addons`);
    
    // Combine all mock addons
    const allAddons = [
      ...this.mockBaggageAddons,
      ...this.mockMealAddons,
      ...this.mockInsuranceAddons,
      ...this.mockOtherAddons
    ];
    
    return of(allAddons).pipe(delay(800));
  }

  /**
   * Get addons by type for a specific flight
   */
  getAddonsByType(flightId: string, type: AddonType): Observable<Addon[]> {
    // In production, this would be:
    // return this.http.get<Addon[]>(`${this.apiUrl}/flights/${flightId}/addons?type=${type}`);
    
    let addons: Addon[] = [];
    
    switch (type) {
      case AddonType.BAGGAGE:
        addons = this.mockBaggageAddons;
        break;
      case AddonType.MEAL:
        addons = this.mockMealAddons;
        break;
      case AddonType.INSURANCE:
        addons = this.mockInsuranceAddons;
        break;
      default:
        addons = this.mockOtherAddons.filter(addon => addon.type === type);
    }
    
    return of(addons).pipe(delay(500));
  }

  /**
   * Save selected addons for a booking
   */
  saveBookingAddons(bookingAddons: BookingAddons): Observable<boolean> {
    // In production, this would be:
    // return this.http.post<boolean>(`${this.apiUrl}/bookings/${bookingAddons.bookingId}/addons`, bookingAddons);
    
    return of(true).pipe(delay(1000));
  }

  /**
   * Get addons for a specific booking
   */
  getBookingAddons(bookingId: string): Observable<BookingAddons> {
    // In production, this would be:
    // return this.http.get<BookingAddons>(`${this.apiUrl}/bookings/${bookingId}/addons`);
    
    // Create a mock booking addons object
    const mockBookingAddons: BookingAddons = {
      bookingId,
      passengerSelections: [
        {
          passengerId: 'p1',
          addons: [
            { addonId: 'bag1', quantity: 1 },
            { addonId: 'meal1', quantity: 1 }
          ]
        },
        {
          passengerId: 'p2',
          addons: [
            { addonId: 'bag2', quantity: 1 },
            { addonId: 'meal2', quantity: 1 }
          ]
        }
      ],
      totalPrice: 900000,
      currency: 'VND'
    };
    
    return of(mockBookingAddons).pipe(delay(800));
  }

  /**
   * Calculate total addon price
   */
  calculateTotalPrice(selections: PassengerAddonSelection[]): Observable<{totalPrice: number, currency: string}> {
    // In production, this would be:
    // return this.http.post<{totalPrice: number, currency: string}>(`${this.apiUrl}/calculate-price`, { selections });
    
    // Get all available addons
    const allAddons = [
      ...this.mockBaggageAddons,
      ...this.mockMealAddons,
      ...this.mockInsuranceAddons,
      ...this.mockOtherAddons
    ];
    
    // Calculate total price
    let totalPrice = 0;
    
    for (const selection of selections) {
      for (const addonSelection of selection.addons) {
        const addon = allAddons.find(a => a.id === addonSelection.addonId);
        if (addon) {
          totalPrice += addon.price * addonSelection.quantity;
        }
      }
    }
    
    return of({ totalPrice, currency: 'VND' }).pipe(delay(500));
  }
} 