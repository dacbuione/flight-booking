import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HotelService, Hotel, Destination } from '../../core/services/hotel.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  popularDestinations: Destination[] = [];
  searchForm: FormGroup;
  isLoading = false;
  isDestinationsLoading = false;
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  constructor(
    private hotelService: HotelService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      destination: [''],
      checkIn: [''],
      checkOut: [''],
      guests: [1],
      rooms: [1]
    });
  }

  ngOnInit(): void {
    this.loadHotels();
    this.loadPopularDestinations();
  }

  loadHotels(): void {
    this.isLoading = true;
    this.hotelService.getHotels().subscribe(hotels => {
      this.hotels = hotels;
      this.filteredHotels = hotels;
      this.totalPages = Math.ceil(this.filteredHotels.length / this.itemsPerPage);
      this.isLoading = false;
    });
  }

  loadPopularDestinations(): void {
    this.isDestinationsLoading = true;
    this.hotelService.getPopularDestinations().subscribe(destinations => {
      this.popularDestinations = destinations;
      this.isDestinationsLoading = false;
    });
  }

  onSearch(): void {
    if (!this.searchForm.valid) return;

    this.isLoading = true;
    const searchParams = this.searchForm.value;

    this.hotelService.searchHotels(searchParams).subscribe(hotels => {
      this.filteredHotels = hotels;
      this.totalPages = Math.ceil(this.filteredHotels.length / this.itemsPerPage);
      this.currentPage = 1;
      this.isLoading = false;
    });
  }

  setDestination(destination: string): void {
    this.searchForm.patchValue({ destination });
    this.onSearch();
  }

  resetFilters(): void {
    this.searchForm.reset({
      destination: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      rooms: 1
    });
    this.filteredHotels = this.hotels;
    this.totalPages = Math.ceil(this.filteredHotels.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  navigateToHotel(id: number): void {
    this.router.navigate(['/hotels', id]);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedHotels(): Hotel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHotels.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
} 