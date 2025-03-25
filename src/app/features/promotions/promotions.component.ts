import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class PromotionsComponent {
  promotions = [
    {
      id: 1,
      title: 'Giảm 30% cho chuyến bay đầu tiên',
      description: 'Áp dụng cho tất cả các chuyến bay trong nước khi đặt lần đầu qua ứng dụng.',
      code: 'FIRST30',
      expiryDate: '2023-12-31',
      image: 'https://ibreak2travel.com/wp-content/uploads/2022/10/Aug-Travel-Promotion-discount15_1200x1300-1.jpg'
    },
    {
      id: 2,
      title: 'Giảm 20% cho chuyến bay quốc tế',
      description: 'Áp dụng cho tất cả chuyến bay quốc tế khi thanh toán bằng thẻ tín dụng.',
      code: 'INTER20',
      expiryDate: '2023-11-30',
      image: 'https://www.everydayonsales.com/wp-content/uploads/2022/08/Malaysia-Airlines-Travel-To-Japan-Promo.jpg'
    },
    {
      id: 3,
      title: 'Combo khách sạn giảm 25%',
      description: 'Đặt vé máy bay và khách sạn cùng lúc để nhận ưu đãi đặc biệt này.',
      code: 'HOTEL25',
      expiryDate: '2024-01-15',
      image: 'https://ik.imagekit.io/tvlk/image/imageResource/2023/05/22/1684730007412-0a8be3f9264041fbdde5198bdb7b689b.webp?tr=q-75'
    }
  ];
} 