import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FrequentFlyer, Benefit, ActivityRecord, TierLevel, ActivityType, RedemptionReward, RewardCategory } from '../models/frequent-flyer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FrequentFlyerService {
  private readonly API_URL = `${environment.apiBaseUrl}/frequent-flyer`;
  
  // Mock data for benefits at different tier levels
  private mockBenefits: Benefit[] = [
    {
      id: 'benefit1',
      name: 'Hành lý ưu tiên',
      description: 'Hành lý của bạn sẽ được ưu tiên xử lý đầu tiên khi hạ cánh',
      icon: '🧳',
      availableTiers: [TierLevel.SILVER, TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit2',
      name: 'Lên máy bay ưu tiên',
      description: 'Lên máy bay trước với làn ưu tiên riêng',
      icon: '✈️',
      availableTiers: [TierLevel.SILVER, TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit3',
      name: 'Chọn chỗ ngồi miễn phí',
      description: 'Chọn chỗ ngồi ưu tiên mà không mất phí bổ sung',
      icon: '💺',
      availableTiers: [TierLevel.SILVER, TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit4',
      name: 'Nâng hạng miễn phí',
      description: 'Nhận 1 lần nâng hạng miễn phí mỗi năm',
      icon: '⬆️',
      availableTiers: [TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit5',
      name: 'Phòng chờ VIP',
      description: 'Truy cập vào phòng chờ VIP tại các sân bay',
      icon: '🛋️',
      availableTiers: [TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit6',
      name: 'Concierge dịch vụ',
      description: 'Dịch vụ concierge cá nhân hóa tại sân bay',
      icon: '👨‍💼',
      availableTiers: [TierLevel.PLATINUM]
    },
    {
      id: 'benefit7',
      name: 'Hành lý miễn phí',
      description: 'Tăng giới hạn hành lý lên 10kg',
      icon: '🧳',
      availableTiers: [TierLevel.GOLD, TierLevel.PLATINUM]
    },
    {
      id: 'benefit8',
      name: 'Tích điểm gấp đôi',
      description: 'Nhận điểm thưởng gấp đôi cho mỗi chuyến bay',
      icon: '2️⃣',
      availableTiers: [TierLevel.PLATINUM]
    }
  ];

  // Mock activity history data
  private mockActivityHistory: { [userId: string]: ActivityRecord[] } = {
    'user1': [
      {
        id: 'act1',
        date: new Date('2023-06-10'),
        activityType: ActivityType.FLIGHT,
        description: 'Chuyến bay SGN-HAN',
        pointsEarned: 500,
        flightId: 'VN123'
      },
      {
        id: 'act2',
        date: new Date('2023-07-15'),
        activityType: ActivityType.FLIGHT,
        description: 'Chuyến bay HAN-DAD',
        pointsEarned: 300,
        flightId: 'VN456'
      },
      {
        id: 'act3',
        date: new Date('2023-08-22'),
        activityType: ActivityType.REDEMPTION,
        description: 'Đổi điểm lấy vé miễn phí',
        pointsEarned: -2000
      },
      {
        id: 'act4',
        date: new Date('2023-09-05'),
        activityType: ActivityType.PROMOTION,
        description: 'Khuyến mãi nhân ngày thành lập',
        pointsEarned: 1000
      },
      {
        id: 'act5',
        date: new Date('2023-10-18'),
        activityType: ActivityType.FLIGHT,
        description: 'Chuyến bay SGN-HPH',
        pointsEarned: 450,
        flightId: 'VN789'
      },
      {
        id: 'act6',
        date: new Date('2023-11-30'),
        activityType: ActivityType.TIER_UPGRADE,
        description: 'Nâng hạng lên SILVER',
        pointsEarned: 0
      },
      {
        id: 'act7',
        date: new Date('2023-12-25'),
        activityType: ActivityType.FLIGHT,
        description: 'Chuyến bay HPH-SGN',
        pointsEarned: 450,
        flightId: 'VN790'
      }
    ]
  };

  constructor(private http: HttpClient) { }

  /**
   * Lấy thông tin khách hàng thân thiết của người dùng
   */
  getUserFrequentFlyer(userId: string): Observable<FrequentFlyer | null> {
    // In a real app, this would make an API call
    // return this.http.get<FrequentFlyer>(`${this.API_URL}/users/${userId}`);
    
    // Mock implementation
    const mockUser: FrequentFlyer = {
      id: 'ff123',
      userId: userId,
      membershipNumber: 'VN' + Math.floor(1000000 + Math.random() * 9000000).toString(),
      tierLevel: TierLevel.SILVER,
      points: 12500,
      tierExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      enrollmentDate: new Date('2023-01-15'),
      benefits: this.getBenefitsByTierInternal(TierLevel.SILVER),
      activityHistory: this.mockActivityHistory[userId] || []
    };
    
    return of(mockUser);
  }

  /**
   * Lấy danh sách các quyền lợi dựa trên cấp thành viên
   */
  getBenefitsByTier(tierLevel: TierLevel): Observable<Benefit[]> {
    // In a real app, this would make an API call
    // return this.http.get<Benefit[]>(`${this.API_URL}/benefits?tier=${tierLevel}`);
    
    // Mock implementation
    return of(this.getBenefitsByTierInternal(tierLevel));
  }

  /**
   * Lấy lịch sử hoạt động của thành viên với phân trang
   */
  getActivityHistory(userId: string, page: number = 1, pageSize: number = 10): Observable<ActivityRecord[]> {
    // In a real app, this would make an API call
    // return this.http.get<ActivityRecord[]>(
    //   `${this.API_URL}/users/${userId}/activities?page=${page}&pageSize=${pageSize}`
    // );
    
    // Mock implementation
    const activities = this.mockActivityHistory[userId] || [];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedActivities = activities.slice(start, end);
    
    return of(paginatedActivities);
  }

  /**
   * Đăng ký người dùng vào chương trình khách hàng thân thiết
   */
  enrollUser(userId: string, firstName: string, lastName: string, email: string): Observable<FrequentFlyer> {
    // In a real app, this would make an API call
    // return this.http.post<FrequentFlyer>(`${this.API_URL}/enroll`, {
    //   userId, firstName, lastName, email
    // });
    
    // Mock implementation
    const mockEnrollment: FrequentFlyer = {
      id: 'ff' + Math.floor(100000 + Math.random() * 900000).toString(),
      userId: userId,
      membershipNumber: 'VN' + Math.floor(1000000 + Math.random() * 9000000).toString(),
      tierLevel: TierLevel.BRONZE,
      points: 0,
      tierExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      enrollmentDate: new Date(),
      benefits: this.getBenefitsByTierInternal(TierLevel.BRONZE),
      activityHistory: []
    };
    
    // Add user to mock data
    this.mockActivityHistory[userId] = [];
    
    return of(mockEnrollment);
  }

  /**
   * Thêm một hoạt động mới vào lịch sử của thành viên
   */
  addActivity(
    userId: string,
    activityType: ActivityType,
    description: string,
    pointsEarned: number,
    flightId?: string
  ): Observable<ActivityRecord> {
    // In a real app, this would make an API call
    // return this.http.post<ActivityRecord>(`${this.API_URL}/users/${userId}/activities`, {
    //   activityType, description, pointsEarned, flightId
    // });
    
    // Mock implementation
    const newActivity: ActivityRecord = {
      id: 'act' + Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date(),
      activityType,
      description,
      pointsEarned,
      flightId
    };
    
    // Add to mock history
    if (!this.mockActivityHistory[userId]) {
      this.mockActivityHistory[userId] = [];
    }
    
    this.mockActivityHistory[userId].unshift(newActivity);
    
    return of(newActivity);
  }

  /**
   * Tính toán điểm thưởng cho chuyến bay dựa trên giá vé và hạng ghế
   */
  calculateFlightPoints(fareAmount: number, fareClass: string): number {
    let multiplier = 1;
    
    // Different multipliers based on fare class
    switch (fareClass.toUpperCase()) {
      case 'ECONOMY':
        multiplier = 1;
        break;
      case 'PREMIUM_ECONOMY':
        multiplier = 1.5;
        break;
      case 'BUSINESS':
        multiplier = 2;
        break;
      case 'FIRST':
        multiplier = 3;
        break;
    }
    
    // Base calculation: 10 points per $1 spent, adjusted by class multiplier
    return Math.floor(fareAmount * 10 * multiplier);
  }

  /**
   * Đổi điểm lấy phần thưởng
   */
  redeemPoints(userId: string, rewardId: string, pointsToRedeem: number): Observable<boolean> {
    // In a real app, this would make an API call
    // return this.http.post<{success: boolean}>(`${this.API_URL}/users/${userId}/redeem`, {
    //   rewardId, pointsToRedeem
    // }).pipe(map(response => response.success));
    
    // Mock implementation - just simulate success
    // In a real app, you'd check if user has enough points, deduct them, etc.
    
    // Add a redemption activity to the history
    this.addActivity(
      userId,
      ActivityType.REDEMPTION,
      'Đổi điểm thưởng: ' + rewardId,
      -pointsToRedeem
    );
    
    return of(true);
  }

  /**
   * Helper method to get benefits for a tier level
   */
  private getBenefitsByTierInternal(tierLevel: TierLevel): Benefit[] {
    return this.mockBenefits.filter(benefit => benefit.availableTiers.includes(tierLevel));
  }
} 