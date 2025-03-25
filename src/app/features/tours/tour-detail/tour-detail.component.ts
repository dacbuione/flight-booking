import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
  itinerary?: {
    day: number;
    title: string;
    description: string;
    meals: string[];
    activities: string[];
    accommodation: string;
  }[];
  gallery?: string[];
  reviews?: {
    author: string;
    rating: number;
    date: string;
    comment: string;
    avatar?: string;
  }[];
}

@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
})
export class TourDetailComponent implements OnInit {
  tourId: string = '';
  tour?: TourPackage;
  bookingForm!: FormGroup;
  activeTab: string = 'overview';
  isLoading: boolean = true;

  // For gallery
  currentImageIndex: number = 0;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Get tour ID from route parameters
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.tourId = id;
        this.loadTourDetails(id);
      }
    });

    // Initialize booking form
    this.initBookingForm();
  }

  private initBookingForm(): void {
    this.bookingForm = this.fb.group({
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  loadTourDetails(id: string): void {
    // Simulate API call with timeout
    this.isLoading = true;
    setTimeout(() => {
      this.tour = this.getMockTourDetails(id);
      this.isLoading = false;
    }, 800);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  nextImage(): void {
    if (this.tour?.gallery) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.tour.gallery.length;
    }
  }

  prevImage(): void {
    if (this.tour?.gallery) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.tour.gallery.length) %
        this.tour.gallery.length;
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  getCurrentImage(): string {
    return (
      this.tour?.gallery?.[this.currentImageIndex] || this.tour?.image || ''
    );
  }

  submitBooking(): void {
    if (this.bookingForm.valid) {
      // Here you would typically handle the booking submission to your backend API
      console.log('Booking submitted:', {
        tourId: this.tourId,
        ...this.bookingForm.value,
      });

      // For demo purposes, just reset the form
      alert('Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      this.bookingForm.reset({
        adults: 1,
        children: 0,
      });
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.bookingForm.controls).forEach((key) => {
        this.bookingForm.get(key)?.markAsTouched();
      });
    }
  }

  getTotalPrice(): number {
    if (!this.tour) return 0;

    const adults = this.bookingForm.value.adults || 0;
    const children = this.bookingForm.value.children || 0;

    // Assuming children get a 50% discount
    return this.tour.price * adults + this.tour.price * 0.5 * children;
  }

  // Method to handle the increment/decrement of guests in booking form
  adjustGuests(type: 'adults' | 'children', change: number): void {
    const control = this.bookingForm.get(type);
    if (control) {
      const currentValue = control.value || 0;
      const newValue = currentValue + change;

      // Ensure adults is at least 1 and children is at least 0
      if (type === 'adults' && newValue >= 1) {
        control.setValue(newValue);
      } else if (type === 'children' && newValue >= 0) {
        control.setValue(newValue);
      }
    }
  }

  // Mock data method
  private getMockTourDetails(id: string): TourPackage {
    const allTours = this.getMockTourPackages();
    const tour = allTours.find((t) => t.id === id);

    if (!tour) {
      throw new Error(`Tour with ID ${id} not found`);
    }

    // Add additional details for the detailed view
    return {
      ...tour,
      itinerary: this.getMockItinerary(id),
      gallery: this.getMockGallery(id),
      reviews: this.getMockReviews(id),
    };
  }

  private getMockItinerary(tourId: string): {
    day: number;
    title: string;
    description: string;
    meals: string[];
    activities: string[];
    accommodation: string;
  }[] {
    // Different itineraries based on tour ID
    const itineraries: Record<
      string,
      {
        day: number;
        title: string;
        description: string;
        meals: string[];
        activities: string[];
        accommodation: string;
      }[]
    > = {
      '1': [
        {
          day: 1,
          title: 'Hà Nội - Hạ Long',
          description:
            'Khởi hành từ Hà Nội đi Hạ Long. Đến nơi, nhận phòng khách sạn và tự do khám phá.',
          meals: ['Trưa', 'Tối'],
          activities: [
            'Di chuyển từ Hà Nội đến Hạ Long',
            'Tham quan thành phố Hạ Long',
            'Nghỉ ngơi tại khách sạn',
          ],
          accommodation: 'Khách sạn 4 sao tại Hạ Long',
        },
        {
          day: 2,
          title: 'Khám phá Vịnh Hạ Long',
          description:
            'Tham gia tour thuyền khám phá Vịnh Hạ Long, thăm các hang động và đảo đẹp.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Tour thuyền tham quan Vịnh Hạ Long',
            'Thăm hang Sửng Sốt',
            'Chèo kayak',
            'Tắm biển tại Bãi Tình Yêu',
          ],
          accommodation: 'Khách sạn 4 sao tại Hạ Long',
        },
        {
          day: 3,
          title: 'Hạ Long - Hà Nội',
          description: 'Buổi sáng tự do. Trưa trả phòng và trở về Hà Nội.',
          meals: ['Sáng', 'Trưa'],
          activities: ['Mua sắm đặc sản địa phương', 'Di chuyển về Hà Nội'],
          accommodation: 'Kết thúc tour',
        },
      ],
      '2': [
        {
          day: 1,
          title: 'TP.HCM - Đà Nẵng',
          description:
            'Đón khách tại sân bay Đà Nẵng, nhận phòng và nghỉ ngơi. Buổi chiều, tham quan bán đảo Sơn Trà và chùa Linh Ứng.',
          meals: ['Tối'],
          activities: [
            'Bay từ TP.HCM đến Đà Nẵng',
            'Thăm bán đảo Sơn Trà',
            'Thăm chùa Linh Ứng',
          ],
          accommodation: 'Khách sạn 4 sao tại Đà Nẵng',
        },
        {
          day: 2,
          title: 'Đà Nẵng - Bà Nà Hills',
          description:
            'Tham quan khu du lịch Bà Nà Hills, trải nghiệm Cầu Vàng nổi tiếng và các trò chơi giải trí.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Khám phá Bà Nà Hills',
            'Tham quan Cầu Vàng',
            'Vui chơi tại Fantasy Park',
          ],
          accommodation: 'Khách sạn 4 sao tại Đà Nẵng',
        },
        {
          day: 3,
          title: 'Đà Nẵng - Hội An',
          description:
            'Khám phá phố cổ Hội An với các địa điểm nổi tiếng như chùa Cầu, nhà cổ Tấn Ký, hội quán Phúc Kiến.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Thăm phố cổ Hội An',
            'Thăm chùa Cầu',
            'Tham quan các nhà cổ',
            'Trải nghiệm đèn lồng Hội An',
          ],
          accommodation: 'Khách sạn 4 sao tại Đà Nẵng',
        },
        {
          day: 4,
          title: 'Đà Nẵng - TP.HCM',
          description:
            'Buổi sáng tự do tắm biển Mỹ Khê. Trưa trả phòng, đi mua đặc sản và ra sân bay về TP.HCM.',
          meals: ['Sáng', 'Trưa'],
          activities: ['Tắm biển Mỹ Khê', 'Mua sắm đặc sản', 'Bay về TP.HCM'],
          accommodation: 'Kết thúc tour',
        },
      ],
      '3': [
        {
          day: 1,
          title: 'TP.HCM - Phú Quốc',
          description:
            'Đón khách tại sân bay Phú Quốc, nhận phòng resort và nghỉ ngơi. Buổi chiều tự do tắm biển.',
          meals: ['Tối'],
          activities: [
            'Bay từ TP.HCM đến Phú Quốc',
            'Nhận phòng và nghỉ ngơi',
            'Tắm biển tại resort',
          ],
          accommodation: 'Resort 5 sao tại Phú Quốc',
        },
        {
          day: 2,
          title: 'Khám phá Nam Đảo Phú Quốc',
          description:
            'Tham quan các điểm du lịch nổi tiếng ở Nam Đảo: Nhà tù Phú Quốc, Bãi Sao, cơ sở sản xuất nước mắm, trại nuôi cấy ngọc trai.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Thăm Nhà tù Phú Quốc',
            'Tắm biển tại Bãi Sao',
            'Thăm cơ sở sản xuất nước mắm',
            'Thăm trại nuôi cấy ngọc trai',
          ],
          accommodation: 'Resort 5 sao tại Phú Quốc',
        },
        {
          day: 3,
          title: 'Khám phá Bắc Đảo Phú Quốc',
          description:
            'Tham quan các điểm du lịch ở Bắc Đảo: Vườn tiêu Phú Quốc, Suối Tranh, Vinpearl Safari.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Thăm vườn tiêu Phú Quốc',
            'Tắm suối tại Suối Tranh',
            'Khám phá Vinpearl Safari',
          ],
          accommodation: 'Resort 5 sao tại Phú Quốc',
        },
        {
          day: 4,
          title: 'Tham quan Vinpearl Land',
          description:
            'Tham quan và vui chơi tại khu giải trí Vinpearl Land với nhiều trò chơi hấp dẫn.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Vui chơi tại Vinpearl Land',
            'Tham quan Thủy cung Vinpearl',
            'Tắm biển',
            'Mua sắm đặc sản',
          ],
          accommodation: 'Resort 5 sao tại Phú Quốc',
        },
        {
          day: 5,
          title: 'Phú Quốc - TP.HCM',
          description:
            'Buổi sáng tự do. Trưa trả phòng và ra sân bay về TP.HCM.',
          meals: ['Sáng'],
          activities: ['Tự do tắm biển', 'Mua sắm đặc sản', 'Bay về TP.HCM'],
          accommodation: 'Kết thúc tour',
        },
      ],
    };

    // Default itinerary for other tour IDs
    return (
      itineraries[tourId] || [
        {
          day: 1,
          title: 'Khởi hành',
          description:
            'Khởi hành từ điểm hẹn, di chuyển đến điểm du lịch và nhận phòng khách sạn.',
          meals: ['Trưa', 'Tối'],
          activities: [
            'Di chuyển đến điểm du lịch',
            'Nhận phòng khách sạn',
            'Tự do khám phá',
          ],
          accommodation: 'Khách sạn/Resort tại điểm du lịch',
        },
        {
          day: 2,
          title: 'Khám phá địa phương',
          description: 'Tham quan các điểm du lịch nổi tiếng của địa phương.',
          meals: ['Sáng', 'Trưa', 'Tối'],
          activities: [
            'Tham quan điểm du lịch',
            'Trải nghiệm văn hóa địa phương',
            'Thưởng thức ẩm thực đặc sản',
          ],
          accommodation: 'Khách sạn/Resort tại điểm du lịch',
        },
        {
          day: 3,
          title: 'Kết thúc hành trình',
          description: 'Trả phòng và di chuyển về điểm xuất phát.',
          meals: ['Sáng', 'Trưa'],
          activities: ['Mua sắm đặc sản', 'Di chuyển về điểm xuất phát'],
          accommodation: 'Kết thúc tour',
        },
      ]
    );
  }

  private getMockGallery(tourId: string): string[] {
    // Different galleries based on tour ID
    const galleries: Record<string, string[]> = {
      '1': [
        'https://cdn.xanhsm.com/2025/02/c0c9124a-vinh-ha-long-1.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv40Jw_AzCxiBmRLlqCQL_rRat56cymQXMDg&s',
        'https://dulichhoangha.com/upload/files/vinh_ha_long.jpg.jpg',
        'https://image.bnews.vn/MediaUpload/Org/2023/07/04/2-20230704111647.jpg',
      ],
      '2': [
        'https://tse4.mm.bing.net/th?id=OIP.N-72y5eKrlGVJArlUo9ljgHaEW&pid=Api',
        'https://tse4.mm.bing.net/th?id=OIP.0L9AzlFQDPUMt7ibAIC-bgHaFj&pid=Api',
        'https://tse2.mm.bing.net/th?id=OIP.22m1Z5eMcezzcClnEWaUfAHaE7&pid=Api',
        'https://tse4.mm.bing.net/th?id=OIP.E74DOwHnboA_-hvy0OfUqwHaEP&pid=Api',
      ],
      '3': [
        'https://dongtayland.vn/wp-content/smush-webp/2019/03/du-hoc-singapore-jcus-minh-hoa-phu-quoc-1024x576.jpg.webp',
        'https://blog.premierresidencesphuquoc.com/wp-content/uploads/2024/12/bai-bien-phu-quoc-4.webp',
        'https://dongtayland.vn/wp-content/smush-webp/2021/05/Nam-dao-Phu-Quoc-02.jpg.webp',
        'https://daivietourist.vn/wp-content/uploads/2024/08/tour-tham-quan-grand-world-phu-quoc-01.jpg.webp',
        'https://static.vinwonders.com/2022/04/du-lich-phu-quoc-thang-11-7-700x435.jpg',
      ],
    };

    // Default gallery for other tour IDs
    return (
      galleries[tourId] || [
        'https://dulichviet.com.vn/images/bandidau/du-lich-viet-nam.jpg',
        'https://vietnamtravel.deals/wp-content/uploads/2020/06/kham-pha-nhung-vung-que-yen-binh-o-viet-nam-7.jpg',
        'https://a.cdn-hotels.com/gdcs/production114/d1591/df3aa424-cd09-4cc7-b19e-f6903c322103.jpg',
      ]
    );
  }

  private getMockReviews(tourId: string): {
    author: string;
    rating: number;
    date: string;
    comment: string;
    avatar?: string;
  }[] {
    // Basic reviews for all tours
    return [
      {
        author: 'Nguyễn Văn A',
        rating: 5,
        date: '2023-05-15',
        comment:
          'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý, khách sạn sạch sẽ.',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        author: 'Trần Thị B',
        rating: 4,
        date: '2023-06-20',
        comment:
          'Chuyến đi rất thú vị, được trải nghiệm nhiều hoạt động. Tuy nhiên, thời gian tự do hơi ít.',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      {
        author: 'Lê Văn C',
        rating: 5,
        date: '2023-07-10',
        comment:
          'Tôi rất hài lòng với tour này. Đồ ăn ngon, phong cảnh đẹp, sẽ quay lại lần sau!',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    ];
  }

  public getMockTourPackages(): TourPackage[] {
    return [
      {
        id: '1',
        title: 'Khám phá Vịnh Hạ Long',
        destination: 'Hạ Long',
        duration: '3 ngày 2 đêm',
        price: 4500000,
        description:
          'Khám phá vẻ đẹp hùng vĩ của Vịnh Hạ Long, di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi và hang động kỳ thú.',
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv40Jw_AzCxiBmRLlqCQL_rRat56cymQXMDg&s',
        rating: 4.8,
        departureDate: '2023-06-15',
        inclusions: [
          'Khách sạn 4 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tham quan',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: true,
      },
      {
        id: '2',
        title: 'Tour Đà Nẵng - Hội An - Bà Nà Hills',
        destination: 'Đà Nẵng',
        duration: '4 ngày 3 đêm',
        price: 5990000,
        description:
          'Tận hưởng kỳ nghỉ tuyệt vời tại thành phố biển Đà Nẵng, khám phá phố cổ Hội An và trải nghiệm Bà Nà Hills với Cầu Vàng nổi tiếng.',
        image:
          'https://i-dulich.vnecdn.net/2020/07/01/shutterstock-1169930359-4299-1593590420.jpg',
        rating: 4.9,
        departureDate: '2023-07-10',
        inclusions: [
          'Khách sạn 4 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tham quan',
          'Vé máy bay',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: true,
      },
      {
        id: '3',
        title: 'Khám phá Phú Quốc',
        destination: 'Phú Quốc',
        duration: '5 ngày 4 đêm',
        price: 8990000,
        description:
          'Tận hưởng kỳ nghỉ sang trọng tại đảo ngọc Phú Quốc với bãi biển cát trắng, làn nước trong xanh và những trải nghiệm độc đáo.',
        image:
          'https://s1.media.ngoisao.vn/news/2025/03/20/tp-phu-quoc-ngoisaovn-w1200-h720.jpg',
        rating: 4.7,
        departureDate: '2023-08-20',
        inclusions: [
          'Resort 5 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tham quan',
          'Vé máy bay',
          'Đón tiễn sân bay',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Tiền tip'],
        featured: true,
      },
      {
        id: '4',
        title: 'Khám phá Nha Trang',
        destination: 'Nha Trang',
        duration: '3 ngày 2 đêm',
        price: 3990000,
        description:
          'Tận hưởng kỳ nghỉ tại thành phố biển Nha Trang với bãi biển đẹp, ẩm thực hải sản tuyệt vời và các hoạt động giải trí phong phú.',
        image:
          'https://letsflytravel.vn/wp-content/uploads/2024/10/bien-nha-trang-1.webp',
        rating: 4.5,
        departureDate: '2023-06-25',
        inclusions: [
          'Khách sạn 4 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tham quan',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Vé máy bay'],
        featured: false,
      },
      {
        id: '5',
        title: 'Du lịch Sapa',
        destination: 'Sapa',
        duration: '2 ngày 1 đêm',
        price: 2990000,
        description:
          'Khám phá vẻ đẹp hùng vĩ của núi rừng Tây Bắc với những thửa ruộng bậc thang, văn hóa dân tộc độc đáo và khí hậu mát mẻ.',
        image:
          'https://ezcloud.vn/wp-content/uploads/2019/05/kinh-nghiem-du-lich-sapa.webp',
        rating: 4.6,
        departureDate: '2023-09-05',
        inclusions: [
          'Khách sạn 3 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tàu hỏa/xe giường nằm',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân'],
        featured: false,
      },
      {
        id: '6',
        title: 'Khám phá Đà Lạt',
        destination: 'Đà Lạt',
        duration: '4 ngày 3 đêm',
        price: 4290000,
        description:
          'Đắm mình trong không khí mát lạnh của thành phố ngàn hoa, khám phá những điểm đến nổi tiếng và thưởng thức ẩm thực đặc sắc.',
        image: 'https://images.vietnamtourism.gov.vn/vn/images/2018/DaLat3.jpg',
        rating: 4.7,
        departureDate: '2023-07-20',
        inclusions: [
          'Khách sạn 4 sao',
          'Ăn 3 bữa',
          'Hướng dẫn viên',
          'Vé tham quan',
          'Xe đưa đón',
        ],
        exclusions: ['Đồ uống', 'Chi phí cá nhân', 'Vé máy bay'],
        featured: false,
      },
    ];
  }
}
