import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

interface TourPackage {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  departureDate: string;
  inclusions: string[];
  exclusions: string[];
  featured: boolean;
}

interface Destination {
  id: string;
  name: string;
  image: string;
  country: string;
  description: string;
  popularFor: string[];
  rating: number;
  tourCount: number;
}

@Component({
  selector: 'app-tours',
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class ToursComponent implements OnInit {
  searchForm!: FormGroup;
  featuredTours: TourPackage[] = [];
  popularDestinations: Destination[] = [];
  allTours: TourPackage[] = [];
  filteredTours: TourPackage[] = [];
  isLoading = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  
  // Sorting options
  sortOptions = [
    { value: 'price-asc', label: 'Giá (thấp đến cao)' },
    { value: 'price-desc', label: 'Giá (cao đến thấp)' },
    { value: 'rating-desc', label: 'Đánh giá (cao nhất trước)' },
    { value: 'duration-asc', label: 'Thời gian (ngắn đến dài)' }
  ];
  
  selectedSort = 'price-asc';
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadFeaturedTours();
    this.loadPopularDestinations();
    this.loadAllTours();
  }
  
  initForm(): void {
    this.searchForm = this.fb.group({
      destination: ['', Validators.required],
      duration: ['any'],
      priceRange: ['any'],
      date: ['']
    });
    
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadFeaturedTours(): void {
    // In a real app, this would be an API call
    this.featuredTours = this.getMockTourPackages().filter(tour => tour.featured);
  }
  
  loadPopularDestinations(): void {
    // In a real app, this would be an API call
    this.popularDestinations = this.getMockDestinations();
  }
  
  loadAllTours(): void {
    this.isLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      this.allTours = this.getMockTourPackages();
      this.filteredTours = [...this.allTours];
      this.totalItems = this.filteredTours.length;
      this.sortTours(this.selectedSort);
      this.isLoading = false;
    }, 1000);
  }
  
  applyFilters(): void {
    const filters = this.searchForm.value;
    
    this.filteredTours = this.allTours.filter(tour => {
      // Destination filter
      if (filters.destination && tour.destination.toLowerCase() !== filters.destination.toLowerCase()) {
        return false;
      }
      
      // Duration filter
      if (filters.duration !== 'any') {
        const [min, max] = filters.duration.split('-').map(Number);
        const tourDuration = parseInt(tour.duration.split(' ')[0], 10);
        
        if (max) {
          if (tourDuration < min || tourDuration > max) return false;
        } else {
          if (tourDuration < min) return false;
        }
      }
      
      // Price range filter
      if (filters.priceRange !== 'any') {
        const [min, max] = filters.priceRange.split('-').map(Number);
        
        if (max) {
          if (tour.price < min || tour.price > max) return false;
        } else {
          if (tour.price < min) return false;
        }
      }
      
      // Date filter
      if (filters.date) {
        const searchDate = new Date(filters.date);
        const tourDate = new Date(tour.departureDate);
        
        if (searchDate.getTime() !== tourDate.getTime()) return false;
      }
      
      return true;
    });
    
    this.totalItems = this.filteredTours.length;
    this.currentPage = 1;
    this.sortTours(this.selectedSort);
  }
  
  setSortOption(option: string): void {
    this.selectedSort = option;
    this.sortTours(option);
  }
  
  sortTours(option: string): void {
    switch (option) {
      case 'price-asc':
        this.filteredTours.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredTours.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        this.filteredTours.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration-asc':
        this.filteredTours.sort((a, b) => {
          const durationA = parseInt(a.duration.split(' ')[0], 10);
          const durationB = parseInt(b.duration.split(' ')[0], 10);
          return durationA - durationB;
        });
        break;
    }
  }
  
  onSearch(): void {
    this.applyFilters();
  }
  
  setDestination(destination: string): void {
    this.searchForm.get('destination')?.setValue(destination);
    this.applyFilters();
  }
  
  getPageItems(): TourPackage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTours.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
  }
  
  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Mock data methods
  private getMockTourPackages(): TourPackage[] {
    return [
      {
        id: '1',
        title: 'Khám phá Vịnh Hạ Long',
        destination: 'Hạ Long',
        duration: '3 ngày 2 đêm',
        price: 4500000,
        description: 'Khám phá vẻ đẹp hùng vĩ của Vịnh Hạ Long, di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi và hang động kỳ thú.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv40Jw_AzCxiBmRLlqCQL_rRat56cymQXMDg&s',
        rating: 4.8,
        departureDate: '2023-06-15',
        inclusions: ['Khách sạn 4 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: true
      },
      {
        id: '2',
        title: 'Tour Đà Nẵng - Hội An - Bà Nà Hills',
        destination: 'Đà Nẵng',
        duration: '4 ngày 3 đêm',
        price: 5990000,
        description: 'Tận hưởng kỳ nghỉ tuyệt vời tại thành phố biển Đà Nẵng, khám phá phố cổ Hội An và trải nghiệm Bà Nà Hills với Cầu Vàng nổi tiếng.',
        image: 'https://i-dulich.vnecdn.net/2020/07/01/shutterstock-1169930359-4299-1593590420.jpg',
        rating: 4.9,
        departureDate: '2023-07-10',
        inclusions: ['Khách sạn 4 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan', 'Vé máy bay'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: true
      },
      {
        id: '3',
        title: 'Khám phá Phú Quốc',
        destination: 'Phú Quốc',
        duration: '5 ngày 4 đêm',
        price: 8990000,
        description: 'Tận hưởng kỳ nghỉ sang trọng tại đảo ngọc Phú Quốc với bãi biển cát trắng, làn nước trong xanh và những trải nghiệm độc đáo.',
        image: 'https://s1.media.ngoisao.vn/news/2025/03/20/tp-phu-quoc-ngoisaovn-w1200-h720.jpg',
        rating: 4.7,
        departureDate: '2023-08-20',
        inclusions: ['Resort 5 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan', 'Vé máy bay', 'Đón tiễn sân bay'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Tiền tip'],
        featured: true
      },
      {
        id: '4',
        title: 'Khám phá Nha Trang',
        destination: 'Nha Trang',
        duration: '3 ngày 2 đêm',
        price: 3990000,
        description: 'Tận hưởng kỳ nghỉ tại thành phố biển Nha Trang với bãi biển đẹp, ẩm thực hải sản tuyệt vời và các hoạt động giải trí phong phú.',
        image: 'https://letsflytravel.vn/wp-content/uploads/2024/10/bien-nha-trang-1.webp',
        rating: 4.5,
        departureDate: '2023-06-25',
        inclusions: ['Khách sạn 4 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Vé máy bay'],
        featured: false
      },
      {
        id: '5',
        title: 'Du lịch Sapa',
        destination: 'Sapa',
        duration: '2 ngày 1 đêm',
        price: 2990000,
        description: 'Khám phá vẻ đẹp hùng vĩ của núi rừng Tây Bắc với những thửa ruộng bậc thang, văn hóa dân tộc độc đáo và khí hậu mát mẻ.',
        image: 'https://ezcloud.vn/wp-content/uploads/2019/05/kinh-nghiem-du-lich-sapa.webp',
        rating: 4.6,
        departureDate: '2023-09-05',
        inclusions: ['Khách sạn 3 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tàu hỏa/xe giường nằm'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: false
      },
      {
        id: '6',
        title: 'Khám phá Đà Lạt',
        destination: 'Đà Lạt',
        duration: '4 ngày 3 đêm',
        price: 4290000,
        description: 'Đắm mình trong không khí mát lạnh của thành phố ngàn hoa, khám phá những điểm đến nổi tiếng và thưởng thức ẩm thực đặc sắc.',
        image: 'https://images.vietnamtourism.gov.vn/vn/images/2018/DaLat3.jpg',
        rating: 4.7,
        departureDate: '2023-07-20',
        inclusions: ['Khách sạn 4 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan', 'Xe đưa đón'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Vé máy bay'],
        featured: false
      },
      {
        id: '7',
        title: 'Tour Hà Nội - Ninh Bình - Tam Cốc',
        destination: 'Ninh Bình',
        duration: '2 ngày 1 đêm',
        price: 2490000,
        description: 'Khám phá Ninh Bình với danh thắng Tam Cốc - Bích Động, Tràng An và hang Múa với cảnh quan non nước hữu tình.',
        image: 'https://thungnham.com/wp-content/uploads/2024/03/khu-du-lich-trang-an-2.webp',
        rating: 4.5,
        departureDate: '2023-08-10',
        inclusions: ['Khách sạn 3 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: false
      },
      {
        id: '8',
        title: 'Khám phá miền Tây sông nước',
        destination: 'Mekong Delta',
        duration: '3 ngày 2 đêm',
        price: 3490000,
        description: 'Trải nghiệm cuộc sống miền Tây sông nước với chợ nổi Cái Răng, vườn trái cây, làng nghề truyền thống và ẩm thực đặc sắc.',
        image: 'https://mientaytourist.vn/wp-content/uploads/2024/04/du-lich-mien-tay-vao-mua-xuan.jpg.webp',
        rating: 4.4,
        departureDate: '2023-09-15',
        inclusions: ['Khách sạn 3 sao', 'Ăn 3 bữa', 'Hướng dẫn viên', 'Vé tham quan', 'Đi thuyền'],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: false
      }
    ];
  }
  
  private getMockDestinations(): Destination[] {
    return [
      {
        id: '1',
        name: 'Hạ Long',
        image: 'https://golden-lotus-hotel.s3.ap-southeast-1.amazonaws.com/uploads/2021/04/013d407166ec4fa56eb1e1f8cbe183b9/images1089892_1.jpg',
        country: 'Việt Nam',
        description: 'Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi và hang động kỳ thú',
        popularFor: ['Du thuyền', 'Khám phá hang động', 'Chèo thuyền kayak'],
        rating: 4.8,
        tourCount: 15
      },
      {
        id: '2',
        name: 'Đà Nẵng',
        image: 'https://i-dulich.vnecdn.net/2020/07/01/shutterstock-1169930359-4299-1593590420.jpg',
        country: 'Việt Nam',
        description: 'Thành phố biển hiện đại với bãi biển đẹp, cầu Rồng và gần nhiều điểm du lịch nổi tiếng',
        popularFor: ['Bãi biển Mỹ Khê', 'Bà Nà Hills', 'Cầu Vàng'],
        rating: 4.9,
        tourCount: 24
      },
      {
        id: '3',
        name: 'Phú Quốc',
        image: 'https://media.travel.com.vn/Tour/tfd__2_10457_cablecar2.webp',
        country: 'Việt Nam',
        description: 'Hòn đảo thiên đường với bãi biển cát trắng, làn nước trong xanh và nhiều hoạt động giải trí',
        popularFor: ['Bãi Sao', 'Vinpearl Safari', 'Lặn biển'],
        rating: 4.7,
        tourCount: 18
      },
      {
        id: '4',
        name: 'Đà Lạt',
        image: 'https://hitour.vn/storage/images/upload/tour-du-lich-da-lat-2-ngay-1-dem-750.webp',
        country: 'Việt Nam',
        description: 'Thành phố ngàn hoa với khí hậu mát mẻ, kiến trúc Pháp và những cảnh quan tuyệt đẹp',
        popularFor: ['Vườn hoa', 'Hồ Tuyền Lâm', 'Núi Langbiang'],
        rating: 4.6,
        tourCount: 20
      }
    ];
  }
} 