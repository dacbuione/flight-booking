import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  Inject,
  HostListener,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Flight Booking';
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild(HeaderComponent) header?: HeaderComponent;

  ngOnInit() {
    if (this.isBrowser) {
      // Scroll to top on navigation
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          window.scrollTo(0, 0);
          this.clearAllMenus();
        });
    }
  }

  // Đảm bảo chỉ có một menu được mở tại một thời điểm
  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent): void {
    if (!this.isBrowser) return;

    // Không làm gì nếu click vào các phần tử của menu
    const target = event.target as HTMLElement;
    if (
      target.closest('.mobile-menu') ||
      target.closest('.hamburger') ||
      target.closest('.mobile-menu-toggle') ||
      target.closest('.user-menu-trigger') ||
      target.closest('.avatar-button') ||
      target.closest('.user-dropdown')
    ) {
      return;
    }

    this.clearAllMenus();
  }

  // Đóng tất cả các menu đang mở
  clearAllMenus(): void {
    if (!this.isBrowser) return;

    // Đóng header dropdown
    if (this.header) {
      this.header.closeAllMenus();
    }

    // Khôi phục scroll
    document.body.style.overflow = '';
  }
}
