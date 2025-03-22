import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FrequentFlyerService } from '../../core/services/frequent-flyer.service';
import { FrequentFlyer, Benefit, ActivityRecord, TierLevel } from '../../core/models/frequent-flyer.model';
import { AuthService } from '../../core/services/auth.service';
import { Observable, of, switchMap, catchError, take } from 'rxjs';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-frequent-flyer',
  templateUrl: './frequent-flyer.component.html',
  styleUrls: ['./frequent-flyer.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FrequentFlyerComponent implements OnInit {
  frequentFlyer$: Observable<FrequentFlyer | null> = of(null);
  benefits$: Observable<Benefit[]> = of([]);
  activityHistory$: Observable<ActivityRecord[]> = of([]);
  isLoading = true;
  error: string | null = null;
  
  // For pagination of activity history
  currentPage = 1;
  pageSize = 5;
  totalActivities = 0;

  // Progress to next tier
  tierProgress = 0;
  nextTier: TierLevel | null = null;
  pointsToNextTier = 0;

  constructor(
    private frequentFlyerService: FrequentFlyerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFrequentFlyerData();
  }

  loadFrequentFlyerData(): void {
    this.isLoading = true;
    
    this.frequentFlyer$ = this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          this.error = 'Vui lòng đăng nhập để xem thông tin khách hàng thân thiết';
          return of(null);
        }
        return this.frequentFlyerService.getUserFrequentFlyer(user.id).pipe(
          catchError(err => {
            this.error = 'Không thể tải thông tin khách hàng thân thiết. Vui lòng thử lại sau.';
            return of(null);
          })
        );
      })
    );

    // Once we have the frequent flyer data, load benefits and activity history
    this.frequentFlyer$.subscribe(flyer => {
      this.isLoading = false;
      
      if (flyer) {
        this.loadBenefits(flyer.tierLevel);
        this.loadActivityHistory(flyer.userId);
        this.calculateNextTierProgress(flyer);
        this.totalActivities = flyer.activityHistory.length;
      }
    });
  }

  loadBenefits(tierLevel: TierLevel): void {
    this.benefits$ = this.frequentFlyerService.getBenefitsByTier(tierLevel).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  loadActivityHistory(userId: string): void {
    this.activityHistory$ = this.frequentFlyerService.getActivityHistory(
      userId, 
      this.currentPage, 
      this.pageSize
    ).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.frequentFlyer$.subscribe(flyer => {
      if (flyer) {
        this.loadActivityHistory(flyer.userId);
      }
    });
  }

  calculateNextTierProgress(flyer: FrequentFlyer): void {
    // Define tier thresholds
    const tierThresholds = {
      [TierLevel.BRONZE]: 0,
      [TierLevel.SILVER]: 10000,
      [TierLevel.GOLD]: 30000,
      [TierLevel.PLATINUM]: 60000
    };
    
    // Find next tier
    switch (flyer.tierLevel) {
      case TierLevel.BRONZE:
        this.nextTier = TierLevel.SILVER;
        break;
      case TierLevel.SILVER:
        this.nextTier = TierLevel.GOLD;
        break;
      case TierLevel.GOLD:
        this.nextTier = TierLevel.PLATINUM;
        break;
      case TierLevel.PLATINUM:
        this.nextTier = null; // Already at highest tier
        break;
    }
    
    if (this.nextTier) {
      const nextTierPoints = tierThresholds[this.nextTier];
      const currentTierPoints = tierThresholds[flyer.tierLevel];
      this.pointsToNextTier = nextTierPoints - flyer.points;
      this.tierProgress = ((flyer.points - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
      
      // Ensure progress is between 0 and 100
      this.tierProgress = Math.max(0, Math.min(100, this.tierProgress));
    } else {
      this.tierProgress = 100; // Already at highest tier
      this.pointsToNextTier = 0;
    }
  }

  enrollInProgram(): void {
    this.authService.currentUser$.pipe(
      take(1)
    ).subscribe((user: User | null) => {
      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.frequentFlyerService.enrollUser(
        user.id, 
        user.firstName || 'New', 
        user.lastName || 'Member', 
        user.email
      ).subscribe({
        next: () => {
          this.loadFrequentFlyerData(); // Reload data after enrollment
        },
        error: () => {
          this.error = 'Không thể đăng ký chương trình khách hàng thân thiết. Vui lòng thử lại sau.';
        }
      });
    });
  }

  getTierName(tier: TierLevel): string {
    return {
      [TierLevel.BRONZE]: 'Hạng Đồng',
      [TierLevel.SILVER]: 'Hạng Bạc',
      [TierLevel.GOLD]: 'Hạng Vàng',
      [TierLevel.PLATINUM]: 'Hạng Bạch Kim'
    }[tier];
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }
} 