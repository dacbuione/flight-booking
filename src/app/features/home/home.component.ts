import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { NgbDropdownModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { HeroComponent } from './components/hero/hero.component';
// Import Swiper core and required modules
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { PLATFORM_ID, Inject } from '@angular/core';
// Don't import bootstrap directly - will handle dynamically in browser only

// Install Swiper modules
Swiper.use([Navigation, Pagination, Autoplay]);

interface Destination {
  id: number;
  name: string;
  code: string;
  image: string;
  description: string;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  image: string;
  discount: string;
  endDate: Date;
}

interface Airline {
  id: number;
  name: string;
  logo: string;
  code: string;
}

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  image: string;
  date: Date;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgbDropdownModule,
    NgbAccordionModule,
    DatePipe,
    TitleCasePipe,
    HeroComponent,
  ],
  standalone: true,
})
export class HomeComponent implements OnInit, AfterViewInit {
  searchForm!: FormGroup;
  tripType: string = 'roundtrip';
  adultCount: number = 1;
  childCount: number = 0;
  infantCount: number = 0;
  flightClass: string = 'economy';
  today = new Date();

  popularDestinations: Destination[] = [
    {
      id: 1,
      name: 'Hà Nội',
      code: 'HAN',
      image:
        'https://plus.unsplash.com/premium_photo-1691960159290-6f4ace6e6c4c?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Thủ đô nghìn năm văn hiến với nhiều di tích lịch sử và văn hóa đặc sắc',
    },
    {
      id: 2,
      name: 'Đà Nẵng',
      code: 'DAD',
      image:
        'https://images.unsplash.com/photo-1620976128192-7181e9f91342?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Thành phố biển xinh đẹp với bãi biển Mỹ Khê tuyệt vời và cầu Rồng nổi tiếng',
    },
    {
      id: 4,
      name: 'Tokyo',
      code: 'TYO',
      image:
        'https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Thành phố hiện đại với truyền thống lâu đời và nền văn hóa sôi động',
    },
    {
      id: 3,
      name: 'Phú Quốc',
      code: 'PQC',
      image:
        'https://images.unsplash.com/photo-1693294603830-f44c9511d643?q=80&w=3133&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description:
        'Hòn đảo thiên đường với những bãi biển nguyên sơ và khu nghỉ dưỡng sang trọng',
    },
  ];

  promotions: Promotion[] = [
    {
      id: 1,
      title: 'Khuyến mãi mùa hè 2025',
      description: 'Giảm giá 30% cho các chuyến bay nội địa trong tháng 6-7',
      image:
        'https://images.unsplash.com/photo-1648475025334-0c4a88aa5709?q=80&w=2946&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      discount: '30% OFF',
      endDate: new Date('2023-07-31'),
    },
    {
      id: 2,
      title: 'Happy Weekend',
      description:
        'Đặt vé cuối tuần và nhận ưu đãi đặc biệt cho các chuyến bay quốc tế',
      image:
        'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      discount: '25% OFF',
      endDate: new Date('2023-08-15'),
    },
    {
      id: 3,
      title: 'Ưu đãi du lịch gia đình',
      description:
        'Giảm giá đặc biệt cho nhóm từ 4 người trở lên khi đặt cùng lúc',
      image:
        'https://images.unsplash.com/photo-1567502401034-b947ee46e249?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      discount: '20% OFF',
      endDate: new Date('2023-09-30'),
    },
  ];

  features = [
    {
      icon: 'fa-solid fa-plane',
      title: 'Wide Selection of Airlines',
      description: 'Choose from over 500 airlines worldwide for your journey.',
    },
    {
      icon: 'fa-solid fa-sack-dollar',
      title: 'Best Price Guarantee',
      description:
        'We guarantee the best prices for your flights with our price match policy.',
    },
    {
      icon: 'fa-solid fa-headset',
      title: '24/7 Customer Support',
      description:
        'Our support team is available round the clock to assist you.',
    },
    {
      icon: 'fa-solid fa-shield',
      title: 'Secure Booking Process',
      description: 'Book with confidence using our secure payment system.',
    },
  ];

  airlines: Airline[] = [
    {
      id: 1,
      name: 'Vietnam Airlines',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXpekkNGqhGpUqhXA24hluYBTi8nAP3SrVPA&s',
      code: 'VN',
    },
    {
      id: 2,
      name: 'Bamboo Airways',
      logo: 'https://inkythuatso.com/uploads/images/2021/09/logo-bamboo-airways-inkythuatso-13-16-26-24.jpg',
      code: 'QH',
    },
    {
      id: 3,
      name: 'Vietjet Air',
      logo: 'https://bestcargo.vn/en/wp-content/uploads/2023/06/VJ971.png',
      code: 'VJ',
    },
    {
      id: 4,
      name: 'Pacific Airlines',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLNuynwHu8TsT3kocClQlkw0O6zDbgzfLxJw&s',
      code: 'BL',
    },
  ];

  latestNews: NewsArticle[] = [
    {
      id: 1,
      title: 'Vietnam mở cửa hoàn toàn du lịch quốc tế',
      description:
        'Việt Nam chính thức mở cửa du lịch quốc tế hoàn toàn từ ngày 15/3/2022 với chính sách thị thực mới.',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZxaEdw2KUTtoAaRjP8NtXXDcTj_-z7ZTNWA&s',
      date: new Date('2022-03-15'),
    },
    {
      id: 2,
      title: 'Các hãng hàng không tăng chuyến dịp hè',
      description:
        'Nhiều hãng hàng không thông báo sẽ tăng tần suất bay trong dịp hè 2023 để đáp ứng nhu cầu du lịch.',
      image:
        'https://baogiaothong.mediacdn.vn/603483875699699712/2024/8/2/image001-11-17225829051891144424889.jpg',
      date: new Date('2023-05-20'),
    },
    {
      id: 3,
      title: 'Cập nhật quy định hành lý xách tay mới',
      description:
        'Từ tháng 6/2023, các hãng hàng không áp dụng quy định mới về hành lý xách tay cho hành khách.',
      image:
        'https://statics.vinpearl.com/quy-dinh-hanh-ly-xach-tay-2_1675064829.jpg',
      date: new Date('2023-06-01'),
    },
    {
      id: 4,
      title: 'Sân bay Long Thành dự kiến hoàn thành giai đoạn 1 vào năm 2025',
      description:
        'Dự án sân bay quốc tế Long Thành đang được đẩy nhanh tiến độ để hoàn thành giai đoạn 1 vào năm 2025.',
      image:
        'https://bcp.cdnchinhphu.vn/334894974524682240/2022/9/12/images2450362phoicanhsanbay-16629455874041897633955.jpg',
      date: new Date('2023-06-15'),
    },
  ];

  faqs: FAQ[] = [
    {
      question: 'Làm thế nào để đặt vé máy bay trực tuyến?',
      answer:
        'Bạn có thể đặt vé máy bay trực tuyến thông qua website hoặc ứng dụng di động của chúng tôi. Chỉ cần nhập điểm đi, điểm đến, ngày bay và số hành khách, sau đó chọn chuyến bay phù hợp và thanh toán.',
    },
    {
      question: 'Tôi có thể thanh toán bằng những phương thức nào?',
      answer:
        'Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau bao gồm thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), và thanh toán tại cửa hàng tiện lợi.',
    },
    {
      question: 'Làm thế nào để hủy hoặc thay đổi vé đã đặt?',
      answer:
        'Bạn có thể hủy hoặc thay đổi vé đã đặt trong mục "Quản lý đặt chỗ" trên website hoặc ứng dụng. Lưu ý rằng có thể phát sinh phí hủy hoặc đổi vé tùy theo chính sách của hãng hàng không.',
    },
    {
      question: 'Hành lý miễn cước cho mỗi hành khách là bao nhiêu?',
      answer:
        'Hành lý miễn cước sẽ khác nhau tùy theo hãng hàng không và loại vé. Thông thường, hạng phổ thông được mang từ 7-23kg hành lý ký gửi. Bạn có thể kiểm tra chính sách hành lý khi đặt vé.',
    },
    {
      question: 'Trẻ em và em bé có cần mua vé không?',
      answer:
        'Trẻ em (từ 2-12 tuổi) cần mua vé trẻ em, thường có giá từ 75-90% giá vé người lớn. Em bé (dưới 2 tuổi) thường được tính 10-25% giá vé người lớn hoặc có thể miễn phí với một số hãng hàng không.',
    },
    {
      question: 'Tôi cần chuẩn bị giấy tờ gì khi đi máy bay?',
      answer:
        'Đối với chuyến bay nội địa, bạn cần CMND/CCCD/Hộ chiếu còn hiệu lực. Với chuyến bay quốc tế, bạn cần Hộ chiếu còn hiệu lực ít nhất 6 tháng và visa (nếu quốc gia đến yêu cầu).',
    },
    {
      question: 'Tôi có thể mang thực phẩm lên máy bay không?',
      answer:
        'Bạn có thể mang thực phẩm khô lên máy bay. Tuy nhiên, chất lỏng phải tuân theo quy định về chất lỏng (thường giới hạn 100ml mỗi chai và phải được đặt trong túi ziplock).',
    },
    {
      question: 'Làm thế nào để chọn chỗ ngồi trên máy bay?',
      answer:
        'Bạn có thể chọn chỗ ngồi trong quá trình đặt vé hoặc sau khi đặt vé thông qua mục "Quản lý đặt chỗ". Một số hãng hàng không có thể tính phí cho dịch vụ chọn chỗ ngồi.',
    },
    {
      question: 'Thời gian làm thủ tục check-in tại sân bay là bao lâu?',
      answer:
        'Đối với chuyến bay nội địa, bạn nên có mặt tại sân bay ít nhất 2 giờ trước giờ khởi hành. Với chuyến bay quốc tế, thời gian khuyến nghị là 3 giờ trước giờ khởi hành.',
    },
    {
      question: 'Tôi có thể làm thủ tục check-in trực tuyến không?',
      answer:
        'Có, hầu hết các hãng hàng không đều cung cấp dịch vụ check-in trực tuyến từ 24-48 giờ trước giờ khởi hành. Bạn có thể check-in trên website hoặc ứng dụng di động của hãng.',
    },
  ];

  featuresSwiper: Swiper | undefined;
  bannerSwiper: Swiper | undefined;

  searchTerm = signal('');
  
  // Computed signals for filtered FAQs
  filteredFaqsLeft = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.faqs.slice(0, 5);
    
    return this.faqs
      .filter(faq => 
        faq.question.toLowerCase().includes(term) || 
        faq.answer.toLowerCase().includes(term)
      )
      .slice(0, 5);
  });
  
  filteredFaqsRight = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.faqs.slice(5, 10);
    
    const filtered = this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(term) || 
      faq.answer.toLowerCase().includes(term)
    );
    
    return filtered.length > 5 ? filtered.slice(5, 10) : [];
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initSearchForm();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initBannerSwiper();
      this.enableAccordionToggle();
    }
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      tripType: [this.tripType, Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departDate: ['', Validators.required],
      returnDate: [''],
      passengers: [
        this.adultCount + this.childCount + this.infantCount,
        Validators.required,
      ],
      flightClass: [this.flightClass, Validators.required],
    });

    // Update returnDate validation based on tripType
    this.searchForm.get('tripType')?.valueChanges.subscribe((value) => {
      this.tripType = value;
      const returnDateControl = this.searchForm.get('returnDate');
      if (value === 'roundtrip') {
        returnDateControl?.setValidators(Validators.required);
      } else {
        returnDateControl?.clearValidators();
      }
      returnDateControl?.updateValueAndValidity();
    });
  }

  increasePassenger(type: string): void {
    if (type === 'adult' && this.adultCount < 9) {
      this.adultCount++;
    } else if (type === 'child' && this.childCount < 9) {
      this.childCount++;
    } else if (type === 'infant' && this.infantCount < 4) {
      this.infantCount++;
    }
    this.updatePassengerCount();
  }

  decreasePassenger(type: string): void {
    if (type === 'adult' && this.adultCount > 1) {
      this.adultCount--;
    } else if (type === 'child' && this.childCount > 0) {
      this.childCount--;
    } else if (type === 'infant' && this.infantCount > 0) {
      this.infantCount--;
    }
    this.updatePassengerCount();
  }

  updatePassengerCount(): void {
    this.searchForm.patchValue({
      passengers: this.adultCount + this.childCount + this.infantCount,
    });
  }

  searchFlights(): void {
    if (this.searchForm.valid) {
      this.router.navigate(['/flight-search'], {
        queryParams: this.searchForm.value,
      });
    }
  }

  selectDestination(destination: Destination): void {
    this.searchForm.patchValue({
      destination: destination.code,
    });
  }

  updateFlightClass(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select) {
      this.flightClass = select.value;
    }
  }

  subscribeNewsletter(email: string): void {
    if (email && this.validateEmail(email)) {
      // Here you would typically call a service to handle the subscription
      console.log('Subscribing email:', email);
      alert('Thank you for subscribing to our newsletter!');
    } else {
      alert('Please enter a valid email address.');
    }
  }

  private validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  private initBannerSwiper(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.bannerSwiper = new Swiper('.banner-carousel', {
          slidesPerView: 1,
          spaceBetween: 20,
          grabCursor: true,
          loop: true,
          autoplay: {
            delay: 2000,
            disableOnInteraction: false,
          },
          pagination: {
            el: '.banner-carousel .swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.banner-carousel .swiper-button-next',
            prevEl: '.banner-carousel .swiper-button-prev',
          },
        });
      } catch (error) {
        console.error('Error initializing banner swiper:', error);
      }
    }
  }

  private enableAccordionToggle(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Safely delay the execution to ensure DOM is ready
      setTimeout(async () => {
        try {
          // Dynamically import bootstrap only in browser
          const bootstrap = await import('bootstrap');
          
          const accordionButtons = document.querySelectorAll('.accordion-button');
          accordionButtons.forEach((button: Element) => {
            button.addEventListener('click', (event: Event) => {
              const targetButton = event.currentTarget as HTMLElement;
              const isExpanded = targetButton.getAttribute('aria-expanded') === 'true';
              const target = targetButton.getAttribute('data-bs-target') || targetButton.getAttribute('href');
              
              if (target) {
                const collapseEl = document.querySelector(target) as HTMLElement;
                if (collapseEl) {
                  // Use try-catch to safely handle potential bootstrap issues
                  try {
                    const bsCollapse = new bootstrap.Collapse(collapseEl, {
                      toggle: false
                    });
                    
                    // Toggle collapse based on current state
                    if (isExpanded) {
                      bsCollapse.hide();
                    } else {
                      bsCollapse.show();
                    }
                  } catch (error) {
                    console.error('Error initializing bootstrap collapse:', error);
                  }
                }
              }
            });
          });
          
          // Open first FAQ after a delay for better UX
          setTimeout(() => {
            const firstAccordionButton = document.querySelector('#accordionQuestion1Header0 .accordion-button') as HTMLElement;
            if (firstAccordionButton) {
              firstAccordionButton.click();
            }
          }, 500);
        } catch (error) {
          console.error('Error initializing accordions:', error);
        }
      }, 200);
    }
  }

  // Search FAQs method
  searchFaqs(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
  
  // Scroll to top method
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
