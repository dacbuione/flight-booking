import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotelService, Hotel } from '../../../core/services/hotel.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface RoomType {
  id: number;
  name: string;
  maxGuests: number;
  bedType: string;
  size: string;
  price: number;
  amenities: string[];
  images: string[];
}

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.scss']
})
export class HotelDetailComponent implements OnInit {
  hotel?: Hotel;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  activeImageIndex = 0;
  
  bookingForm: FormGroup;
  isBookingFormVisible = false;
  isBookingSubmitted = false;
  
  similarHotels: Hotel[] = [];
  isSimilarHotelsLoading = false;

  roomTypes: RoomType[] = [
    {
      id: 1,
      name: 'Phòng Standard',
      maxGuests: 2,
      bedType: 'Giường đôi',
      size: '25m²',
      price: 800000,
      amenities: ['Wi-Fi miễn phí', 'TV màn hình phẳng', 'Điều hòa', 'Minibar', 'Bàn làm việc'],
      images: ['https://ezcloud.vn/wp-content/uploads/2023/03/can-phong-standard.webp']
    },
    {
      id: 2,
      name: 'Phòng Deluxe',
      maxGuests: 3,
      bedType: 'Giường đôi lớn',
      size: '35m²',
      price: 1200000,
      amenities: ['Wi-Fi miễn phí', 'TV màn hình phẳng', 'Điều hòa', 'Minibar', 'Bàn làm việc', 'Bồn tắm', 'Tầm nhìn thành phố'],
      images: ['https://ezcloud.vn/wp-content/uploads/2023/03/can-phong-deluxe.webp']
    },
    {
      id: 3,
      name: 'Phòng Suite',
      maxGuests: 4,
      bedType: 'Giường đôi lớn + Sofa giường',
      size: '50m²',
      price: 1800000,
      amenities: ['Wi-Fi miễn phí', 'TV màn hình phẳng', 'Điều hòa', 'Minibar', 'Bàn làm việc', 'Bồn tắm', 'Phòng khách riêng', 'Tầm nhìn thành phố', 'Dịch vụ phòng 24/7'],
      images: ['https://aeros.vn/upload/images/aeros-phong-suite-la-gi-6.webp']
    }
  ];
  
  selectedRoomType: RoomType = this.roomTypes[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      guests: [2],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    this.loadHotelDetails();
    this.setMinDates();
  }

  loadHotelDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.handleError('ID khách sạn không hợp lệ');
      return;
    }

    this.isLoading = true;
    this.hotelService.getHotelById(id).subscribe(
      (hotel) => {
        if (hotel) {
          this.hotel = hotel;
          this.calculateRoomPrices(hotel.price);
          this.loadSimilarHotels();
        } else {
          this.handleError('Không tìm thấy khách sạn');
        }
        this.isLoading = false;
      },
      (error) => {
        this.handleError('Đã xảy ra lỗi khi tải thông tin khách sạn');
        this.isLoading = false;
      }
    );
  }

  loadSimilarHotels(): void {
    if (!this.hotel) return;
    
    this.isSimilarHotelsLoading = true;
    this.hotelService.getHotels().subscribe(
      (hotels) => {
        // Filter hotels in the same location but exclude current hotel
        this.similarHotels = hotels
          .filter(h => h.location.includes(this.hotel!.location.split(',')[0]) && h.id !== this.hotel!.id)
          .slice(0, 3);
        this.isSimilarHotelsLoading = false;
      },
      (error) => {
        console.error('Error loading similar hotels:', error);
        this.isSimilarHotelsLoading = false;
      }
    );
  }

  handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  setMinDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates as YYYY-MM-DD for input[type="date"]
    const todayFormatted = today.toISOString().split('T')[0];
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    this.bookingForm.get('checkIn')?.setValue(todayFormatted);
    this.bookingForm.get('checkOut')?.setValue(tomorrowFormatted);
  }

  calculateRoomPrices(basePrice: number): void {
    // Set prices for room types based on the hotel's base price
    this.roomTypes[0].price = basePrice;
    this.roomTypes[1].price = basePrice * 1.3; // Deluxe costs 30% more
    this.roomTypes[2].price = basePrice * 1.8; // Suite costs 80% more
  }

  changeRoomType(roomId: number): void {
    const room = this.roomTypes.find(r => r.id === roomId);
    if (room) {
      this.selectedRoomType = room;
    }
  }

  toggleBookingForm(): void {
    this.isBookingFormVisible = !this.isBookingFormVisible;
  }

  onBookingSubmit(): void {
    if (this.bookingForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    // Here you would send the booking data to the server
    console.log('Booking data:', {
      ...this.bookingForm.value,
      roomType: this.selectedRoomType.name,
      totalPrice: this.calculateTotalPrice()
    });
    
    // Show success message
    this.isBookingSubmitted = true;
    
    // Reset form after a delay
    setTimeout(() => {
      this.isBookingFormVisible = false;
      this.isBookingSubmitted = false;
      this.bookingForm.reset();
    }, 3000);
  }

  calculateTotalPrice(): number {
    const checkInDate = new Date(this.bookingForm.get('checkIn')?.value);
    const checkOutDate = new Date(this.bookingForm.get('checkOut')?.value);
    
    if (!checkInDate || !checkOutDate) {
      return this.selectedRoomType.price;
    }
    
    // Calculate number of nights
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return this.selectedRoomType.price * nights;
  }

  navigateToHotel(id: number): void {
    this.router.navigate(['/hotels', id]);
    // Scroll to top when navigating to a new hotel
    window.scrollTo(0, 0);
  }

  // Format currency for display
  formatCurrency(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
} 