import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  newsArticles: NewsArticle[] = [];
  featuredArticles: NewsArticle[] = [];
  filteredArticles: NewsArticle[] = [];
  categories: string[] = [];
  isLoading = true;
  selectedCategory: string = 'all';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  loadMockData(): void {
    // Mock data for news articles
    this.newsArticles = [
      {
        id: 1,
        title: 'Vietnam Airlines mở thêm đường bay mới đến Châu Âu',
        summary: 'Hãng hàng không quốc gia Việt Nam bổ sung thêm đường bay thẳng đến Paris và Frankfurt từ tháng 9/2023.',
        content: 'Từ ngày 15/9/2023, Vietnam Airlines sẽ chính thức khai thác đường bay thẳng từ Hà Nội đến Paris (Pháp) và Frankfurt (Đức) với tần suất 3 chuyến/tuần cho mỗi đường bay. Hãng sử dụng máy bay hiện đại Boeing 787-9 Dreamliner cho các đường bay này.\n\nViệc mở rộng mạng bay đến châu Âu nằm trong chiến lược phát triển dài hạn của Vietnam Airlines, đồng thời đáp ứng nhu cầu đi lại ngày càng tăng giữa Việt Nam và các nước châu Âu.',
        image: 'assets/images/news/vietnam-airlines-europe.jpg',
        category: 'Hãng hàng không',
        author: 'Nguyễn Văn A',
        date: '10/08/2023',
        tags: ['Vietnam Airlines', 'Đường bay mới', 'Châu Âu']
      },
      {
        id: 2,
        title: 'Top 10 điểm đến du lịch được yêu thích nhất năm 2023',
        summary: 'Khám phá những điểm đến du lịch hot nhất trong năm 2023 với nhiều trải nghiệm độc đáo và hấp dẫn.',
        content: 'Năm 2023 chứng kiến sự trở lại mạnh mẽ của ngành du lịch toàn cầu. Theo thống kê mới nhất từ Tổ chức Du lịch Thế giới (UNWTO), lượng khách du lịch quốc tế đã tăng 40% so với năm 2022.\n\nTrong đó, 10 điểm đến được du khách yêu thích nhất gồm: Bali (Indonesia), Phú Quốc (Việt Nam), Tokyo (Nhật Bản), Paris (Pháp), Rome (Ý), New York (Mỹ), Dubai (UAE), Barcelona (Tây Ban Nha), Phuket (Thái Lan) và Cancun (Mexico).\n\nPhú Quốc là đại diện duy nhất của Việt Nam lọt vào danh sách này, với lượng khách quốc tế tăng gấp đôi so với năm ngoái nhờ chính sách miễn thị thực 30 ngày và nhiều dịch vụ du lịch cao cấp.',
        image: 'assets/images/news/top-destinations.jpg',
        category: 'Du lịch',
        author: 'Trần Thị B',
        date: '05/08/2023',
        tags: ['Du lịch', 'Điểm đến', 'Phú Quốc']
      },
      {
        id: 3,
        title: 'Bamboo Airways giới thiệu hạng ghế mới trên các chuyến bay quốc tế',
        summary: 'Hãng hàng không Bamboo Airways nâng cấp trải nghiệm bay với hạng ghế Premium Economy trên các đường bay quốc tế.',
        content: 'Bamboo Airways vừa chính thức giới thiệu hạng ghế Premium Economy trên các chuyến bay quốc tế, bắt đầu từ tháng 10/2023. Hạng ghế mới này cung cấp trải nghiệm bay cao cấp hơn so với hạng phổ thông nhưng có giá thành hợp lý hơn hạng thương gia.\n\nGhế Premium Economy của Bamboo Airways có không gian rộng hơn 20% so với ghế phổ thông, với độ ngả lưng lên đến 40 độ và không gian để chân thoải mái. Hành khách sẽ được phục vụ thực đơn riêng biệt, ưu tiên làm thủ tục và hành lý miễn cước lên đến 35kg.',
        image: 'assets/images/news/bamboo-premium.jpg',
        category: 'Hãng hàng không',
        author: 'Lê Văn C',
        date: '01/08/2023',
        tags: ['Bamboo Airways', 'Premium Economy', 'Dịch vụ bay']
      },
      {
        id: 4,
        title: 'Cập nhật quy định mới về hành lý xách tay trên các chuyến bay quốc tế',
        summary: 'Từ 1/9/2023, các hãng hàng không siết chặt quy định về kích thước và trọng lượng hành lý xách tay.',
        content: 'Theo thông báo mới từ Hiệp hội Vận tải Hàng không Quốc tế (IATA), từ ngày 1/9/2023, nhiều hãng hàng không quốc tế sẽ áp dụng quy định mới về hành lý xách tay nhằm tối ưu hóa không gian khoang hành khách và đảm bảo an toàn.\n\nCụ thể, kích thước tối đa cho hành lý xách tay sẽ là 55cm x 40cm x 20cm (bao gồm bánh xe và tay cầm), và trọng lượng không vượt quá 7kg. Ngoài ra, mỗi hành khách chỉ được mang 1 túi nhỏ đựng laptop hoặc túi xách với kích thước không quá 40cm x 30cm x 10cm.\n\nCác hãng hàng không lớn như Emirates, Qatar Airways, Singapore Airlines, và Cathay Pacific đã xác nhận sẽ áp dụng quy định mới này.',
        image: 'assets/images/news/luggage-rules.jpg',
        category: 'Quy định bay',
        author: 'Phạm Thị D',
        date: '28/07/2023',
        tags: ['Hành lý', 'Quy định mới', 'Chuyến bay quốc tế']
      },
      {
        id: 5,
        title: 'Vietjet Air khai trương đường bay thẳng đến Australia',
        summary: 'Hãng hàng không Vietjet Air chính thức mở đường bay thẳng từ TP.HCM đến Melbourne và Sydney.',
        content: 'Vietjet Air vừa chính thức khai trương đường bay thẳng từ TP.HCM đến hai thành phố lớn của Australia là Melbourne và Sydney. Đây là bước tiến quan trọng trong chiến lược mở rộng mạng bay quốc tế của hãng.\n\nĐường bay TP.HCM - Melbourne sẽ có tần suất 4 chuyến/tuần vào các ngày thứ Hai, thứ Tư, thứ Sáu và Chủ nhật. Trong khi đó, đường bay TP.HCM - Sydney sẽ khai thác 5 chuyến/tuần vào các ngày thứ Hai, thứ Ba, thứ Năm, thứ Bảy và Chủ nhật.\n\nVietjet sử dụng máy bay Airbus A330 cho các đường bay mới này, với thời gian bay trung bình khoảng 8 giờ.',
        image: 'assets/images/news/vietjet-australia.jpg',
        category: 'Hãng hàng không',
        author: 'Hoàng Văn E',
        date: '25/07/2023',
        tags: ['Vietjet Air', 'Australia', 'Đường bay mới']
      },
      {
        id: 6,
        title: 'Khuyến mãi lớn: Vé máy bay chỉ từ 199.000 đồng cho các chuyến bay nội địa',
        summary: 'Các hãng hàng không đồng loạt tung ra chương trình khuyến mãi hấp dẫn nhân dịp mùa du lịch thu - đông.',
        content: 'Nhân dịp mùa du lịch thu - đông 2023, các hãng hàng không trong nước đồng loạt tung ra chương trình khuyến mãi lớn với giá vé chỉ từ 199.000 đồng (chưa bao gồm thuế, phí) cho các chuyến bay nội địa.\n\nCụ thể, Vietnam Airlines, Pacific Airlines và VASCO cung cấp hơn 1 triệu vé khuyến mãi cho các đường bay nội địa, áp dụng cho thời gian bay từ 1/9/2023 đến 31/3/2024. Vietjet Air và Bamboo Airways cũng tham gia cuộc đua giảm giá với các mức ưu đãi tương tự.\n\nChương trình bán vé khuyến mãi sẽ diễn ra từ ngày 15/8 đến hết ngày 31/8/2023, hành khách có thể đặt vé qua website, ứng dụng di động hoặc các đại lý chính thức của các hãng bay.',
        image: 'assets/images/news/ticket-promo.jpg',
        category: 'Khuyến mãi',
        author: 'Nguyễn Văn F',
        date: '20/07/2023',
        tags: ['Khuyến mãi', 'Vé máy bay', 'Du lịch']
      },
      {
        id: 7,
        title: '5 cách tiết kiệm chi phí khi đặt vé máy bay',
        summary: 'Những mẹo hữu ích giúp bạn săn vé máy bay giá rẻ và tối ưu chi phí cho chuyến du lịch.',
        content: 'Đặt vé máy bay luôn chiếm một phần lớn trong ngân sách cho mỗi chuyến du lịch. Dưới đây là 5 cách hiệu quả giúp bạn tiết kiệm chi phí khi đặt vé:\n\n1. Đặt vé sớm: Nên đặt vé trước 2-3 tháng để có giá tốt nhất.\n\n2. Sử dụng công cụ so sánh giá: Các website như Skyscanner, Google Flights hay Kayak giúp bạn so sánh giá vé của nhiều hãng bay khác nhau.\n\n3. Đăng ký nhận thông báo giảm giá: Theo dõi các chương trình khuyến mãi từ hãng hàng không qua email hoặc ứng dụng di động.\n\n4. Linh hoạt thời gian bay: Các chuyến bay vào giữa tuần (thứ Ba, thứ Tư) thường có giá thấp hơn cuối tuần.\n\n5. Tận dụng điểm thưởng: Đăng ký thẻ tín dụng hoặc chương trình khách hàng thân thiết để tích lũy điểm thưởng đổi vé máy bay.',
        image: 'assets/images/news/saving-tips.jpg',
        category: 'Mẹo du lịch',
        author: 'Trần Thị G',
        date: '15/07/2023',
        tags: ['Tiết kiệm', 'Đặt vé', 'Mẹo du lịch']
      },
      {
        id: 8,
        title: 'Sân bay Long Thành dự kiến khai thác vào năm 2025',
        summary: 'Dự án sân bay quốc tế Long Thành đang được đẩy nhanh tiến độ để khai thác giai đoạn 1 vào năm 2025.',
        content: 'Dự án sân bay quốc tế Long Thành (Đồng Nai) đang được tích cực triển khai với mục tiêu đưa vào khai thác giai đoạn 1 vào năm 2025. Hiện tại, dự án đã hoàn thành khoảng 65% khối lượng công việc của giai đoạn 1.\n\nTheo thông tin từ Bộ Giao thông Vận tải, giai đoạn 1 của sân bay Long Thành sẽ có công suất 25 triệu hành khách/năm, với nhà ga hành khách có diện tích 373.000 m2 và 1 đường cất hạ cánh.\n\nKhi hoàn thành toàn bộ 3 giai đoạn vào năm 2050, sân bay Long Thành sẽ trở thành một trong những sân bay lớn nhất khu vực với công suất 100 triệu hành khách/năm, giúp giảm tải cho sân bay Tân Sơn Nhất và nâng cao vị thế của ngành hàng không Việt Nam.',
        image: 'assets/images/news/long-thanh-airport.jpg',
        category: 'Hạ tầng hàng không',
        author: 'Lê Văn H',
        date: '10/07/2023',
        tags: ['Sân bay Long Thành', 'Hạ tầng', 'Hàng không']
      },
      {
        id: 9,
        title: 'Xu hướng du lịch chậm (Slow Travel) đang ngày càng phổ biến',
        summary: 'Du lịch chậm - phong cách du lịch tập trung vào trải nghiệm sâu sắc thay vì tham quan nhiều điểm đến.',
        content: 'Du lịch chậm (Slow Travel) đang trở thành xu hướng ngày càng phổ biến, đặc biệt là sau đại dịch COVID-19. Khác với phong cách du lịch truyền thống tập trung vào việc tham quan càng nhiều điểm đến càng tốt, du lịch chậm khuyến khích du khách dành nhiều thời gian hơn tại một điểm đến để trải nghiệm sâu sắc văn hóa, ẩm thực và lối sống địa phương.\n\nTheo khảo sát của Booking.com, có tới 47% du khách toàn cầu đang hướng đến phong cách du lịch chậm trong năm 2023. Tại Việt Nam, các điểm đến như Hội An, Mai Châu, Đà Lạt hay Côn Đảo đang trở thành những điểm đến lý tưởng cho du lịch chậm với không gian yên bình và nhiều hoạt động gắn kết với thiên nhiên, văn hóa địa phương.',
        image: 'assets/images/news/slow-travel.jpg',
        category: 'Du lịch',
        author: 'Phạm Thị I',
        date: '05/07/2023',
        tags: ['Du lịch chậm', 'Xu hướng du lịch', 'Trải nghiệm']
      },
      {
        id: 10,
        title: 'Ứng dụng công nghệ AI trong ngành hàng không',
        summary: 'Các hãng hàng không và sân bay đang ứng dụng trí tuệ nhân tạo để cải thiện trải nghiệm hành khách.',
        content: 'Trí tuệ nhân tạo (AI) đang tạo ra cuộc cách mạng trong ngành hàng không, từ quy trình đặt vé đến trải nghiệm tại sân bay và trên máy bay. Các hãng hàng không lớn trên thế giới đang đầu tư mạnh vào công nghệ này để nâng cao hiệu quả hoạt động và cải thiện dịch vụ khách hàng.\n\nMột số ứng dụng nổi bật của AI trong ngành hàng không bao gồm:\n\n- Chatbot hỗ trợ khách hàng 24/7 với khả năng giải quyết hơn 80% các vấn đề thông thường.\n\n- Hệ thống nhận diện khuôn mặt giúp rút ngắn thời gian làm thủ tục và kiểm tra an ninh.\n\n- Thuật toán dự đoán giá vé, giúp hãng bay tối ưu hóa doanh thu và cung cấp cho khách hàng thời điểm đặt vé tốt nhất.\n\n- Phân tích dữ liệu lớn để dự đoán và giảm thiểu độ trễ chuyến bay.\n\nTại Việt Nam, Vietnam Airlines và Vietjet Air cũng đã bắt đầu ứng dụng AI vào quy trình vận hành và dịch vụ khách hàng.',
        image: 'assets/images/news/ai-aviation.jpg',
        category: 'Công nghệ',
        author: 'Hoàng Văn J',
        date: '01/07/2023',
        tags: ['AI', 'Công nghệ', 'Hàng không']
      }
    ];

    // Extract unique categories
    const allCategories = this.newsArticles.map(article => article.category);
    this.categories = [...new Set(allCategories)];

    // Set featured articles (first 3 articles)
    this.featuredArticles = this.newsArticles.slice(0, 3);

    // Set filtered articles to all initially
    this.filteredArticles = [...this.newsArticles];
    this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredArticles = [...this.newsArticles];
    } else {
      this.filteredArticles = this.newsArticles.filter(article => article.category === category);
    }
    
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedArticles(): NewsArticle[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredArticles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
} 