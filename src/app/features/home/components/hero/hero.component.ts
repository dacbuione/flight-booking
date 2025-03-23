import { Component, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Initialize Swiper modules
Swiper.use([Navigation, Pagination, Autoplay, EffectFade]);

// Define interfaces for our data structures
interface AirportLocation {
  code: string;
  name: string;
  cityName: string;
  country: string;
  type: string;
  isPopular: boolean;
}

interface CityLocation {
  code: string;
  name: string;
  country: string;
  type: string;
  isPopular: boolean;
}

interface SeatClassOption {
  value: string;
  label: string;
  description: string;
}

interface PassengerType {
  key: string;
  label: string;
  ageDescription: string;
  min: number;
  max: number;
}

interface SearchQueryParams {
  tripType: string;
  origin: string;
  destination: string;
  departDate: string;
  seatClass: string;
  adults: number;
  children: number;
  infants: number;
  returnDate?: string;
  promoCode?: string;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf
  ],
})
export class HeroComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  today = new Date();
  
  // Banner backgrounds
  backgrounds = [
    'https://images.unsplash.com/photo-1536323760109-ca8c07450053?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544468266-6a8948087de9?q=80&w=1920&auto=format&fit=crop'
  ];
  
  // Dropdowns visibility state
  isSeatClassDropdownVisible = false;
  isPassengerDropdownVisible = false;
  isPromoCodeVisible = false;
  
  // Location selector
  isLocationSelectorVisible = false;
  currentLocationInput = '';
  locationSearchQuery = '';
  activeLocationTab = 'popular';
  filteredLocations: (AirportLocation | CityLocation)[] = [];
  
  // Seat class options
  seatClassOptions: SeatClassOption[] = [
    {
      value: 'economy',
      label: 'Phổ thông',
      description: 'Lựa chọn tiết kiệm với dịch vụ cơ bản',
    },
    {
      value: 'premium_economy',
      label: 'Phổ thông đặc biệt',
      description: 'Ghế rộng hơn và nhiều đặc quyền hơn phổ thông',
    },
    {
      value: 'business',
      label: 'Thương gia',
      description: 'Trải nghiệm đẳng cấp với không gian rộng rãi và dịch vụ cao cấp',
    },
    {
      value: 'first',
      label: 'Hạng nhất',
      description: 'Trải nghiệm xa xỉ với dịch vụ cá nhân hoá và đẳng cấp hàng đầu',
    },
  ];
  
  // Passenger types
  passengerTypes: PassengerType[] = [
    {
      key: 'adults',
      label: 'Người lớn',
      ageDescription: 'Từ 12 tuổi trở lên',
      min: 1,
      max: 9,
    },
    {
      key: 'children',
      label: 'Trẻ em',
      ageDescription: 'Từ 2 đến dưới 12 tuổi',
      min: 0,
      max: 8,
    },
    {
      key: 'infants',
      label: 'Em bé',
      ageDescription: 'Dưới 2 tuổi',
      min: 0,
      max: 4,
    },
  ];
  
  // Airport data
  airports: AirportLocation[] = [
    {
      code: 'SGN',
      name: 'Sân bay Tân Sơn Nhất',
      cityName: 'Hồ Chí Minh',
      country: 'Việt Nam',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'HAN',
      name: 'Sân bay Nội Bài',
      cityName: 'Hà Nội',
      country: 'Việt Nam',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'DAD',
      name: 'Sân bay Đà Nẵng',
      cityName: 'Đà Nẵng',
      country: 'Việt Nam',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'PQC',
      name: 'Sân bay Phú Quốc',
      cityName: 'Phú Quốc',
      country: 'Việt Nam',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'CXR',
      name: 'Sân bay Cam Ranh',
      cityName: 'Nha Trang',
      country: 'Việt Nam',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'BKK',
      name: 'Sân bay Suvarnabhumi',
      cityName: 'Bangkok',
      country: 'Thái Lan',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'SIN',
      name: 'Sân bay Changi',
      cityName: 'Singapore',
      country: 'Singapore',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'ICN',
      name: 'Sân bay Incheon',
      cityName: 'Seoul',
      country: 'Hàn Quốc',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'NRT',
      name: 'Sân bay Narita',
      cityName: 'Tokyo',
      country: 'Nhật Bản',
      type: 'airport',
      isPopular: true
    },
    {
      code: 'HKG',
      name: 'Sân bay Quốc tế Hồng Kông',
      cityName: 'Hồng Kông',
      country: 'Hồng Kông',
      type: 'airport',
      isPopular: true
    }
  ];
  
  // City data
  cities: CityLocation[] = [
    {
      code: 'SGN',
      name: 'Hồ Chí Minh',
      country: 'Việt Nam',
      type: 'city',
      isPopular: true
    },
    {
      code: 'HAN',
      name: 'Hà Nội',
      country: 'Việt Nam',
      type: 'city',
      isPopular: true
    },
    {
      code: 'DAD',
      name: 'Đà Nẵng',
      country: 'Việt Nam',
      type: 'city',
      isPopular: true
    }
  ];
  
  private swiperInstance: Swiper | null = null;
  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.initSearchForm();
    
    if (this.isBrowser) {
      this.initSwiper();
    }
    
    // Initialize filtered locations
    this.filteredLocations = [...this.airports, ...this.cities]
      .filter(location => location.isPopular)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Check for query params to pre-fill the form
    this.route.queryParams.subscribe(params => {
      if (params['origin']) {
        this.searchForm.get('origin')?.setValue(params['origin']);
      }
      if (params['destination']) {
        this.searchForm.get('destination')?.setValue(params['destination']);
      }
    });
    
    // Add click outside handler only in browser environment
    if (this.isBrowser) {
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      // Clean up Swiper
      if (this.swiperInstance) {
        this.swiperInstance.destroy();
        this.swiperInstance = null;
      }
      
      // Remove event listeners
      document.removeEventListener('click', this.handleDocumentClick.bind(this));
    }
  }
  
  // Handle document clicks for dropdown closing
  private handleDocumentClick(event: MouseEvent): void {
    // Already handled in HostListener
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      tripType: ['roundtrip', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departDate: [null, Validators.required],
      returnDate: [null],
      seatClass: ['economy', Validators.required],
      promoCode: [''],
      // Create nested form groups for each passenger type
      adults: this.fb.group({
        count: [1, [Validators.required, Validators.min(1), Validators.max(9)]]
      }),
      children: this.fb.group({
        count: [0, [Validators.required, Validators.min(0), Validators.max(8)]]
      }),
      infants: this.fb.group({
        count: [0, [Validators.required, Validators.min(0), Validators.max(4)]]
      })
    });
    
    // Add validator for return date when trip type is roundtrip
    this.searchForm.get('tripType')?.valueChanges.subscribe(tripType => {
      const returnDateControl = this.searchForm.get('returnDate');
      if (tripType === 'roundtrip') {
        returnDateControl?.setValidators([Validators.required]);
      } else {
        returnDateControl?.clearValidators();
        returnDateControl?.setValue(null);
      }
      returnDateControl?.updateValueAndValidity();
    });
  }

  initSwiper(): void {
    if (!this.isBrowser) return;
    
    // Wait for DOM to be ready
    setTimeout(() => {
      const swiperElement = document.querySelector('.banner-swiper');
      if (!swiperElement) return;
      
      this.swiperInstance = new Swiper('.banner-swiper', {
        modules: [Navigation, Pagination, Autoplay, EffectFade],
        slidesPerView: 1,
        speed: 1000,
        loop: true,
        effect: 'fade',
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.dynamic-pagination',
          clickable: true,
          renderBullet: function(index, className) {
            return `<span class="${className}"></span>`;
          }
        }
      });
    }, 100);
  }

  // Trip type methods
  setTripType(type: string): void {
    this.searchForm.get('tripType')?.setValue(type);
  }

  // Seat class methods
  toggleSeatClassDropdown(): void {
    this.isSeatClassDropdownVisible = !this.isSeatClassDropdownVisible;
    if (this.isSeatClassDropdownVisible) {
      this.isPassengerDropdownVisible = false;
    }
  }

  selectSeatClass(seatClass: string): void {
    this.searchForm.get('seatClass')?.setValue(seatClass);
  }

  getSeatClassDisplay(): string {
    const seatClass = this.searchForm.get('seatClass')?.value;
    const option = this.seatClassOptions.find(opt => opt.value === seatClass);
    return option ? option.label : 'Hạng ghế';
  }

  // Passenger methods
  togglePassengerDropdown(event: Event): void {
    event.stopPropagation();
    this.isPassengerDropdownVisible = !this.isPassengerDropdownVisible;
    if (this.isPassengerDropdownVisible) {
      this.isSeatClassDropdownVisible = false;
    }
  }

  getPassengerSummary(): string {
    const adults = this.searchForm.get('adults.count')?.value || 0;
    const children = this.searchForm.get('children.count')?.value || 0;
    const infants = this.searchForm.get('infants.count')?.value || 0;
    const total = adults + children + infants;
    
    return `${total} hành khách`;
  }

  increasePassenger(type: string): void {
    const control = this.searchForm.get(type)?.get('count');
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(currentValue + 1);
    }
  }

  decreasePassenger(type: string): void {
    const control = this.searchForm.get(type)?.get('count');
    if (control) {
      const currentValue = control.value || 0;
      if (currentValue > 0 && (type !== 'adults' || currentValue > 1)) {
        control.setValue(currentValue - 1);
      }
    }
  }

  getPassengerCount(type: string): number {
    return this.searchForm.get(type)?.get('count')?.value || 0;
  }

  getTotalPassengers(): number {
    return this.passengerTypes.reduce((total, type) => {
      const count = this.getPassengerCount(type.key);
      return total + count;
    }, 0);
  }

  // Promo code methods
  togglePromoCodeField(): void {
    this.isPromoCodeVisible = !this.isPromoCodeVisible;
  }

  // Location selector methods
  openLocationSelector(type: string): void {
    this.currentLocationInput = type;
    this.isLocationSelectorVisible = true;
    this.locationSearchQuery = '';
    this.filterLocations();
  }

  closeLocationSelector(): void {
    this.isLocationSelectorVisible = false;
  }

  setLocationTab(tab: string): void {
    this.activeLocationTab = tab;
    this.filterLocations();
  }

  filterLocations(): void {
    let allLocations: (AirportLocation | CityLocation)[] = [...this.airports, ...this.cities];
    
    // Filter by search query
    if (this.locationSearchQuery.trim()) {
      const query = this.locationSearchQuery.toLowerCase();
      allLocations = allLocations.filter(location => 
        location.name.toLowerCase().includes(query) || 
        location.code.toLowerCase().includes(query) ||
        ('cityName' in location && location.cityName.toLowerCase().includes(query)) ||
        location.country.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (this.activeLocationTab === 'popular') {
      allLocations = allLocations.filter(location => location.isPopular);
    }
    
    this.filteredLocations = allLocations;
  }

  selectLocation(location: AirportLocation | CityLocation): void {
    this.searchForm.get(this.currentLocationInput)?.setValue(location.code);
    this.closeLocationSelector();
  }

  getAirportDisplayName(field: string): string {
    const code = this.searchForm.get(field)?.value;
    if (!code) return '';
    
    const airport = this.airports.find(a => a.code === code);
    if (airport) {
      return `${airport.cityName} (${airport.code})`;
    }
    
    const city = this.cities.find(c => c.code === code);
    if (city) {
      return `${city.name} (${city.code})`;
    }
    
    return code;
  }

  // Flight search form methods
  swapLocations(): void {
    const origin = this.searchForm.get('origin')?.value;
    const destination = this.searchForm.get('destination')?.value;
    
    this.searchForm.get('origin')?.setValue(destination);
    this.searchForm.get('destination')?.setValue(origin);
  }

  getMinReturnDate(): Date {
    const departDate = this.searchForm.get('departDate')?.value;
    return departDate || this.today;
  }

  searchFlights(): void {
    if (this.searchForm.valid) {
      const queryParams: SearchQueryParams = {
        tripType: this.searchForm.get('tripType')?.value,
        origin: this.searchForm.get('origin')?.value,
        destination: this.searchForm.get('destination')?.value,
        departDate: this.formatDate(this.searchForm.get('departDate')?.value),
        seatClass: this.searchForm.get('seatClass')?.value,
        adults: this.searchForm.get('adults.count')?.value,
        children: this.searchForm.get('children.count')?.value,
        infants: this.searchForm.get('infants.count')?.value,
      };
      
      if (this.searchForm.get('tripType')?.value === 'roundtrip') {
        queryParams.returnDate = this.formatDate(this.searchForm.get('returnDate')?.value);
      }
      
      if (this.searchForm.get('promoCode')?.value) {
        queryParams.promoCode = this.searchForm.get('promoCode')?.value;
      }
      
      this.router.navigate(['/flight-search/results'], { queryParams });
    }
  }

  // Type guards
  isAirportLocation(location: AirportLocation | CityLocation): location is AirportLocation {
    return location.type === 'airport';
  }

  // Helper methods
  formatDate(date: Date): string {
    if (!date) return '';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  // Click outside to close dropdowns
  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent): void {
    if (!this.isBrowser) return;
    
    // Ignore clicks inside dropdowns
    const target = event.target as HTMLElement;
    const isInsideDropdown = 
      target.closest('.dropdown-panel') || 
      target.closest('.form-control-wrapper');
    
    if (!isInsideDropdown) {
      this.isSeatClassDropdownVisible = false;
      this.isPassengerDropdownVisible = false;
    }
  }
}
