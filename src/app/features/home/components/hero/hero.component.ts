import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  PLATFORM_ID,
  Inject,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, of } from 'rxjs';
// Import Swiper modules
import Swiper from 'swiper';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Router } from '@angular/router';

// Mock data for airports
interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  popular: boolean;
  domestic: boolean;
  international: boolean;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule,
  ],
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  searchForm!: FormGroup;
  today = new Date();
  currentBackgroundIndex = signal<number>(0);

  // Passenger counts
  adultCount = signal<number>(1);
  childCount = signal<number>(0);
  infantCount = signal<number>(0);

  // UI state
  isPassengerDropdownOpen = false;
  isSeatClassDropdownOpen = false;
  isPromoCodeVisible = false;

  // Airports data
  airports: Airport[] = [
    {
      code: 'HAN',
      name: 'Nội Bài',
      city: 'Hà Nội',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'SGN',
      name: 'Tân Sơn Nhất',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'DAD',
      name: 'Đà Nẵng',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'CXR',
      name: 'Cam Ranh',
      city: 'Nha Trang',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'PQC',
      name: 'Phú Quốc',
      city: 'Phú Quốc',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'VCA',
      name: 'Cần Thơ',
      city: 'Cần Thơ',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'HUI',
      name: 'Phú Bài',
      city: 'Huế',
      country: 'Việt Nam',
      popular: true,
      domestic: true,
      international: false,
    },
    {
      code: 'BKK',
      name: 'Suvarnabhumi',
      city: 'Bangkok',
      country: 'Thái Lan',
      popular: true,
      domestic: false,
      international: true,
    },
    {
      code: 'SIN',
      name: 'Changi',
      city: 'Singapore',
      country: 'Singapore',
      popular: true,
      domestic: false,
      international: true,
    },
    {
      code: 'ICN',
      name: 'Incheon',
      city: 'Seoul',
      country: 'Hàn Quốc',
      popular: true,
      domestic: false,
      international: true,
    },
    {
      code: 'NRT',
      name: 'Narita',
      city: 'Tokyo',
      country: 'Nhật Bản',
      popular: true,
      domestic: false,
      international: true,
    },
    {
      code: 'KUL',
      name: 'Kuala Lumpur',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'HKG',
      name: 'Hong Kong',
      city: 'Hong Kong',
      country: 'Hong Kong',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'TPE',
      name: 'Taipei',
      city: 'Taipei',
      country: 'Đài Loan',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'SYD',
      name: 'Sydney',
      city: 'Sydney',
      country: 'Úc',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'MEL',
      name: 'Melbourne',
      city: 'Melbourne',
      country: 'Úc',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'LHR',
      name: 'London',
      city: 'London',
      country: 'Anh',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'CDG',
      name: 'Paris',
      city: 'Paris',
      country: 'Pháp',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'FRA',
      name: 'Frankfurt',
      city: 'Frankfurt',
      country: 'Đức',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'JFK',
      name: 'New York',
      city: 'New York',
      country: 'Mỹ',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'LAX',
      name: 'Los Angeles',
      city: 'Los Angeles',
      country: 'Mỹ',
      popular: false,
      domestic: false,
      international: true,
    },
    {
      code: 'SFO',
      name: 'San Francisco',
      city: 'San Francisco',
      country: 'Mỹ',
      popular: false,
      domestic: false,
      international: true,
    },
  ];

  // Seat classes
  seatClasses = [
    { value: 'economy', display: 'Phổ thông' },
    { value: 'premium', display: 'Phổ thông đặc biệt' },
    { value: 'business', display: 'Thương gia' },
    { value: 'first', display: 'Hạng nhất' },
  ];

  private animationFrameId: number | null = null;
  private lastUpdateTime = 0;
  private readonly ROTATION_INTERVAL = 30000; // 30 seconds

  readonly backgrounds = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1920&auto=format&fit=crop',
  ];

  private isBrowser: boolean;
  private swiper: Swiper | undefined;

  // Location selector
  isLocationSelectorVisible = false;
  locationSelectorType: 'origin' | 'destination' = 'origin';
  locationSearchText = '';
  filteredAirports: Airport[] = [];
  activeLocationTab: 'popular' | 'all' | 'domestic' | 'international' =
    'popular';

  // Click outside directive to close dropdowns
  clickOutsideListener: any;

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialize form with safe defaults
    this.initializeForm();
  }

  /**
   * Initialize form with safe defaults
   * This is done in constructor to ensure it's available before template binding
   */
  private initializeForm(): void {
    // Default dates
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 7);
    
    // Create form with default values
    this.searchForm = this.fb.group({
      tripType: ['roundtrip', Validators.required],
      origin: ['HAN', Validators.required],
      destination: ['SGN', Validators.required],
      departDate: [today, Validators.required],
      returnDate: [returnDate, Validators.required],
      adults: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
      children: [0, [Validators.required, Validators.min(0), Validators.max(9)]],
      infants: [0, [Validators.required, Validators.min(0), Validators.max(4)]],
      seatClass: ['economy', Validators.required],
      promoCode: [''],
      flexibleDates: [false],
    });
    
    // Set validators conditionally for return date based on trip type
    this.setTripType('roundtrip');
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startBackgroundRotation();

      // Listen for trip type changes to update form
      this.searchForm.get('tripType')?.valueChanges.subscribe((value) => {
        this.handleTripTypeChange(value);
      });

      // Add listener for departDate changes to update returnDate min value
      this.searchForm.get('departDate')?.valueChanges.subscribe((value) => {
        // If departDate is after returnDate, update returnDate
        const returnDateControl = this.searchForm.get('returnDate');
        const returnDate = returnDateControl?.value;
        if (returnDate && value && new Date(value) > new Date(returnDate)) {
          returnDateControl?.setValue(value);
        }
      });

      // Close passenger dropdown when clicking outside
      document.addEventListener('click', this.handleOutsideClick.bind(this));

      // Initialize filtered airports
      this.filterAirports();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initSwiper();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Destroy swiper if exists
      if (this.swiper) {
        this.swiper.destroy();
      }

      // Remove event listener on destroy
      document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  /**
   * Handles clicks outside the dropdowns to close them
   */
  handleOutsideClick(event: MouseEvent) {
    if (!this.isBrowser) return;

    // Handle passenger dropdown
    const passengerDropdown = document.querySelector('.passenger-menu');
    const passengerButton = document.querySelector('.passenger-btn');

    if (
      this.isPassengerDropdownOpen &&
      passengerDropdown &&
      passengerButton &&
      !passengerDropdown.contains(event.target as Node) &&
      !passengerButton.contains(event.target as Node)
    ) {
      this.isPassengerDropdownOpen = false;
    }

    // Handle seat class dropdown
    const seatClassDropdown = document.querySelector('.seat-class-menu');
    const seatClassButton = document.querySelector(
      '.selector-item:first-child'
    );

    if (
      this.isSeatClassDropdownOpen &&
      seatClassDropdown &&
      seatClassButton &&
      !seatClassDropdown.contains(event.target as Node) &&
      !seatClassButton.contains(event.target as Node)
    ) {
      this.isSeatClassDropdownOpen = false;
    }
  }

  /**
   * Toggle passenger dropdown visibility
   */
  togglePassengerDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isPassengerDropdownOpen = !this.isPassengerDropdownOpen;
    this.isSeatClassDropdownOpen = false;

    if (this.isPassengerDropdownOpen) {
      setTimeout(() => this.positionDropdown('passenger'), 0);
    }
  }

  /**
   * Toggle seat class dropdown visibility
   */
  toggleSeatClassDropdown() {
    this.isSeatClassDropdownOpen = !this.isSeatClassDropdownOpen;
    this.isPassengerDropdownOpen = false;

    if (this.isSeatClassDropdownOpen) {
      setTimeout(() => this.positionDropdown('seat-class'), 0);
    }
  }

  /**
   * Toggle promo code field visibility
   */
  togglePromoCodeField() {
    this.isPromoCodeVisible = !this.isPromoCodeVisible;
  }

  private startBackgroundRotation() {
    if (!this.isBrowser) return;

    const animate = (timestamp: number) => {
      if (timestamp - this.lastUpdateTime >= this.ROTATION_INTERVAL) {
        if (!document.hidden) {
          this.currentBackgroundIndex.update((current) =>
            current === this.backgrounds.length - 1 ? 0 : current + 1
          );
        }
        this.lastUpdateTime = timestamp;
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  getCurrentBackground() {
    return this.backgrounds[this.currentBackgroundIndex()];
  }

  setTripType(type: 'oneway' | 'roundtrip') {
    this.searchForm.get('tripType')?.setValue(type);
    this.handleTripTypeChange(type);
  }

  handleTripTypeChange(type: string) {
    if (type === 'roundtrip') {
      this.searchForm.get('returnDate')?.enable();

      // When enabling returnDate, make sure it's not before departDate
      const departDate = this.searchForm.get('departDate')?.value;
      const returnDate = this.searchForm.get('returnDate')?.value;

      if (
        departDate &&
        returnDate &&
        new Date(departDate) > new Date(returnDate)
      ) {
        this.searchForm.get('returnDate')?.setValue(departDate);
      }
    } else {
      this.searchForm.get('returnDate')?.disable();
    }
  }

  getFormattedAirport(airport: Airport | string | null): string {
    if (!airport) return '';

    if (typeof airport === 'string') {
      const found = this.airports.find((a) => a.code === airport);
      if (found) {
        return `${found.city} (${found.code})`;
      }
      return airport;
    }

    return `${airport.city} (${airport.code})`;
  }

  displayAirport(airport: Airport | string | null): string {
    if (!airport) return '';

    if (typeof airport === 'string') {
      const found = this.airports.find((a) => a.code === airport);
      if (found) {
        return `${found.city} (${found.code})`;
      }
      return airport;
    }

    return `${airport.city} (${airport.code})`;
  }

  swapLocations() {
    const origin = this.searchForm.get('origin')?.value;
    const destination = this.searchForm.get('destination')?.value;

    this.searchForm.patchValue({
      origin: destination,
      destination: origin,
    });
  }

  increasePassenger(type: 'adults' | 'children' | 'infants') {
    const control = this.searchForm.get(type);
    if (!control) return;

    const currentValue = control.value;

    if (type === 'adults' && currentValue < 9) {
      control.setValue(currentValue + 1);
    } else if (type === 'children' && currentValue < 9) {
      control.setValue(currentValue + 1);
    } else if (type === 'infants') {
      const adultsValue = this.searchForm.get('adults')?.value || 1;
      if (currentValue < 4 && currentValue < adultsValue) {
        control.setValue(currentValue + 1);
      }
    }
  }

  decreasePassenger(type: 'adults' | 'children' | 'infants') {
    const control = this.searchForm.get(type);
    if (!control) return;

    const currentValue = control.value;

    if (type === 'adults' && currentValue > 1) {
      const newValue = currentValue - 1;
      control.setValue(newValue);

      // Adjust infants if needed
      const infantsControl = this.searchForm.get('infants');
      if (infantsControl && infantsControl.value > newValue) {
        infantsControl.setValue(newValue);
      }
    } else if (type === 'children' && currentValue > 0) {
      control.setValue(currentValue - 1);
    } else if (type === 'infants' && currentValue > 0) {
      control.setValue(currentValue - 1);
    }
  }

  getPassengerSummary(): string {
    const adults = this.searchForm.get('adults')?.value || 1;
    const children = this.searchForm.get('children')?.value || 0;
    const infants = this.searchForm.get('infants')?.value || 0;

    const totalPassengers = adults + children + infants;
    let summary = `${totalPassengers} Hành khách`;

    // Add details if there are children or infants
    if (children > 0 || infants > 0) {
      let details = [];
      details.push(`${adults} người lớn`);
      if (children > 0) details.push(`${children} trẻ em`);
      if (infants > 0) details.push(`${infants} em bé`);
      summary += ` (${details.join(', ')})`;
    }

    return `${summary}`;
  }

  searchFlights() {
    if (this.searchForm.valid) {
      const formData = this.searchForm.value;

      // Navigate to flight listing page with search parameters
      this.router.navigate(['/flight-listing'], {
        queryParams: {
          origin: formData.origin,
          destination: formData.destination,
          departDate: this.formatDate(formData.departDate),
          returnDate:
            formData.tripType === 'roundtrip'
              ? this.formatDate(formData.returnDate)
              : null,
          adults: this.adultCount(),
          children: this.childCount(),
          infants: this.infantCount(),
          cabinClass: formData.seatClass,
          tripType: 'oneway',
          // tripType: formData.tripType,
          flexibleDates: formData.flexibleDates || false,
        },
      });
    }
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private initSwiper() {
    // Khởi tạo Swiper với các thông số cơ bản
    this.swiper = new Swiper('.banner-swiper', {
      modules: [Pagination, Autoplay, EffectFade],
      slidesPerView: 1,
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.dynamic-pagination',
        clickable: true,
      },
    });
  }

  /**
   * Set selected seat class
   */
  selectSeatClass(value: string) {
    this.searchForm.get('seatClass')?.setValue(value);
    this.isSeatClassDropdownOpen = false;
  }

  /**
   * Get the display text for the selected seat class
   */
  getSeatClassDisplay(): string {
    const currentClass = this.searchForm.get('seatClass')?.value;
    const selectedClass = this.seatClasses.find(
      (c) => c.value === currentClass
    );
    return selectedClass ? selectedClass.display : 'Phổ thông';
  }

  /**
   * Get total number of passengers
   */
  getTotalPassengers(): number {
    return (
      this.searchForm.get('adults')?.value +
      this.searchForm.get('children')?.value +
      this.searchForm.get('infants')?.value
    );
  }

  /**
   * Set quick search parameters
   */
  setQuickSearch(origin: string, destination: string, event: Event) {
    event.preventDefault();

    this.searchForm.patchValue({
      origin: origin,
      destination: destination,
      departDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      returnDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      tripType: 'roundtrip',
    });

    this.handleTripTypeChange('roundtrip');

    // Scroll to the search form
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Location selector methods
  openLocationSelector(type: 'origin' | 'destination') {
    this.locationSelectorType = type;
    this.isLocationSelectorVisible = true;
    this.locationSearchText = '';
    this.setLocationTab('popular');

    // Close other dropdowns
    this.isSeatClassDropdownOpen = false;
    this.isPassengerDropdownOpen = false;
  }

  closeLocationSelector() {
    this.isLocationSelectorVisible = false;
  }

  filterAirports() {
    let filtered: Airport[];

    // First filter based on active tab
    if (this.activeLocationTab === 'popular') {
      filtered = this.airports.filter((airport) => airport.popular);
    } else if (this.activeLocationTab === 'domestic') {
      filtered = this.airports.filter((airport) => airport.domestic);
    } else if (this.activeLocationTab === 'international') {
      filtered = this.airports.filter((airport) => airport.international);
    } else {
      filtered = [...this.airports];
    }

    // Then filter based on search text
    if (this.locationSearchText) {
      const searchText = this.locationSearchText.toLowerCase();
      filtered = filtered.filter(
        (airport) =>
          airport.code.toLowerCase().includes(searchText) ||
          airport.city.toLowerCase().includes(searchText) ||
          airport.name.toLowerCase().includes(searchText) ||
          airport.country.toLowerCase().includes(searchText)
      );
    }

    // Exclude current selected location in the other field
    const otherField =
      this.locationSelectorType === 'origin' ? 'destination' : 'origin';
    const otherLocation = this.searchForm.get(otherField)?.value;

    if (otherLocation) {
      filtered = filtered.filter((airport) => airport.code !== otherLocation);
    }

    this.filteredAirports = filtered;
  }

  clearSearch() {
    this.locationSearchText = '';
    this.filterAirports();
  }

  setLocationTab(tab: 'popular' | 'all' | 'domestic' | 'international') {
    this.activeLocationTab = tab;
    this.filterAirports();
  }

  selectAirport(code: string) {
    this.searchForm.get(this.locationSelectorType)?.setValue(code);
    this.closeLocationSelector();
  }

  /**
   * Get the display name for the airport based on its code
   */
  getAirportDisplayName(code: string): string {
    const airport = this.airports.find((a) => a.code === code);
    return airport ? `${airport.name}, ${airport.city}` : code;
  }

  positionDropdown(type: 'passenger' | 'seat-class') {
    if (!this.isBrowser) return;

    const triggerElement =
      type === 'passenger'
        ? document.querySelector('.passenger-btn')
        : document.querySelector('.selector-item:not(.passenger-btn)');

    const dropdownElement =
      type === 'passenger'
        ? document.querySelector('.dropdown-menu.passenger-menu')
        : document.querySelector('.dropdown-menu.seat-class-menu');

    if (!triggerElement || !dropdownElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const dropdownRect = dropdownElement.getBoundingClientRect();

    // Calculate position
    let top = triggerRect.top - dropdownRect.height - 10; // Position above button by default
    const left = triggerRect.left + triggerRect.width - dropdownRect.width;

    // If dropdown would go off the top of the screen, position it below the button
    if (top < 10) {
      top = triggerRect.bottom + 10;
    }

    // Apply position to dropdown
    (dropdownElement as HTMLElement).style.top = `${top}px`;
    (dropdownElement as HTMLElement).style.left = `${left}px`;
  }
}
