import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, delay } from 'rxjs';

export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  images: string[];
  description: string;
  amenities: string[];
}

export interface HotelSearchParams {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface Destination {
  id: number;
  name: string;
  image: string;
  hotels: number;
}

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private apiUrl = 'api/hotels';

  // Mock data for hotels
  private mockHotels: Hotel[] = [
    {
      id: 1,
      name: 'Vinpearl Resort & Spa',
      location: 'Nha Trang, Việt Nam',
      price: 2500000,
      rating: 4.8,
      images: [
        'https://dongtayland.vn/wp-content/smush-webp/2018/06/biet-thu-bien-vinpearl-resort-spa-nha-trang-bay-3.jpg.webp',
      ],
      description:
        'Sang trọng và đẳng cấp với tầm nhìn tuyệt đẹp ra biển, trải nghiệm dịch vụ 5 sao cùng nhiều tiện ích giải trí.',
      amenities: ['Hồ bơi', 'Spa', 'Wifi miễn phí', 'Phòng gym', 'Nhà hàng'],
    },
    {
      id: 2,
      name: 'InterContinental Danang',
      location: 'Đà Nẵng, Việt Nam',
      price: 2500000,
      rating: 4.9,
      images: [
        'https://cdn.thuonggiaonline.vn/images/224f071e792c6c3abd6ec284ce15907927fb0051f72735ca7f61e2c2d69014dfc75ecc3186f9c83f45a566b2b8d93a4280827609b1896b4b728e1f1119f2d40078f62a8a8bd96a924e98883f0e127827/Bai-Bac-Bay-Villa-Exterior-1.JPG.webp',
      ],
      description:
        'Khu nghỉ dưỡng sang trọng nằm trên bán đảo Sơn Trà với kiến trúc độc đáo và dịch vụ đẳng cấp quốc tế.',
      amenities: ['Bãi biển riêng', 'Spa', 'Wifi miễn phí', 'Nhà hàng', 'Bar'],
    },
    {
      id: 3,
      name: 'JW Marriott Phu Quoc',
      location: 'Phú Quốc, Việt Nam',
      price: 1800000,
      rating: 4.7,
      images: [
        'https://cdn1.ivivu.com/images/2024/06/26/11/JWOverview_x64l8x_.webp',
      ],
      description:
        'Khu nghỉ dưỡng với thiết kế lấy cảm hứng từ trường đại học giả tưởng Lamarck, mang đến trải nghiệm độc đáo.',
      amenities: ['Hồ bơi', 'Spa', 'Fitness center', 'Nhà hàng', 'Bar'],
    },
    {
      id: 4,
      name: 'Mường Thanh Grand',
      location: 'Hà Nội, Việt Nam',
      price: 800000,
      rating: 4.3,
      images: [
        'https://cdn1.ivivu.com/images/2023/08/30/13/MTGHL_50unds_horizontal.webp',
      ],
      description:
        'Khách sạn hiện đại nằm ở trung tâm thành phố, thuận tiện cho cả chuyến đi công tác và du lịch.',
      amenities: [
        'Wifi miễn phí',
        'Nhà hàng',
        'Phòng họp',
        'Dịch vụ phòng 24h',
      ],
    },
    {
      id: 5,
      name: 'Rex Hotel',
      location: 'Hồ Chí Minh, Việt Nam',
      price: 1500000,
      rating: 4.5,
      images: [
        'https://image.vietgoing.com/hotel/01/01/large/vietgoing_vxm2203146328.webp',
      ],
      description:
        'Khách sạn lịch sử nằm ở trung tâm Sài Gòn, nổi tiếng với sân thượng Rooftop Garden và di sản văn hóa.',
      amenities: ['Hồ bơi', 'Nhà hàng', 'Bar', 'Trung tâm thương mại', 'Spa'],
    },
    {
      id: 6,
      name: 'FLC Luxury Resort',
      location: 'Quy Nhơn, Việt Nam',
      price: 1700000,
      rating: 4.6,
      images: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEvqyE5j_epQlk9f8bNAB9kINjdch-yNwx3g&s',
      ],
      description:
        'Khu nghỉ dưỡng với tầm nhìn đẹp ra biển, sân golf đẳng cấp quốc tế và nhiều hoạt động giải trí.',
      amenities: ['Sân golf', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Thể thao biển'],
    },
  ];

  // Mock data for popular destinations
  private mockDestinations: Destination[] = [
    {
      id: 1,
      name: 'Hạ Long',
      image:
        'https://golden-lotus-hotel.s3.ap-southeast-1.amazonaws.com/uploads/2021/04/013d407166ec4fa56eb1e1f8cbe183b9/images1089892_1.jpg',
      hotels: 120,
    },
    {
      id: 2,
      name: 'Đà Nẵng',
      image:
        'https://i-dulich.vnecdn.net/2020/07/01/shutterstock-1169930359-4299-1593590420.jpg',
      hotels: 230,
    },
    {
      id: 3,
      name: 'Đà Lạt',
      image: 'https://images.vietnamtourism.gov.vn/vn/images/2018/DaLat3.jpg',
      hotels: 180,
    },
    {
      id: 4,
      name: 'Phú Quốc',
      image:
        'https://s1.media.ngoisao.vn/news/2025/03/20/tp-phu-quoc-ngoisaovn-w1200-h720.jpg',
      hotels: 150,
    },
  ];

  constructor(private http: HttpClient) {}

  // Get all hotels with optional search parameters
  getHotels(params?: HotelSearchParams): Observable<Hotel[]> {
    // In a real-world scenario, this would make an HTTP request to the API
    // For this demo, we'll use mock data with a simulated delay
    return of(this.filterHotels(params)).pipe(delay(800));
  }

  // Get hotel by id
  getHotelById(id: number): Observable<Hotel | undefined> {
    const hotel = this.mockHotels.find((h) => h.id === id);
    return of(hotel).pipe(delay(500));
  }

  // Get popular destinations
  getPopularDestinations(): Observable<Destination[]> {
    return of(this.mockDestinations).pipe(delay(600));
  }

  // Private helper method to filter hotels based on search parameters
  private filterHotels(params?: HotelSearchParams): Hotel[] {
    if (!params) {
      return this.mockHotels;
    }

    return this.mockHotels.filter((hotel) => {
      // Filter by destination if provided
      if (
        params.destination &&
        !hotel.location.toLowerCase().includes(params.destination.toLowerCase())
      ) {
        return false;
      }

      // Filter by price range if provided
      if (params.minPrice && hotel.price < params.minPrice) {
        return false;
      }
      if (params.maxPrice && hotel.price > params.maxPrice) {
        return false;
      }

      // Filter by rating if provided
      if (params.rating && hotel.rating < params.rating) {
        return false;
      }

      return true;
    });
  }

  searchHotels(params: HotelSearchParams): Observable<Hotel[]> {
    let filteredHotels = [...this.mockHotels];

    if (params.destination) {
      filteredHotels = filteredHotels.filter((hotel) =>
        hotel.location.toLowerCase().includes(params.destination!.toLowerCase())
      );
    }

    if (params.minPrice) {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.price >= params.minPrice!
      );
    }

    if (params.maxPrice) {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.price <= params.maxPrice!
      );
    }

    if (params.rating) {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.rating >= params.rating!
      );
    }

    return of(filteredHotels).pipe(delay(800));
  }
}
