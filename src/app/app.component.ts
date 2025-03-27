import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AutoLoginService } from './core/services/auto-login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Flight Booking';
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private autoLoginService = inject(AutoLoginService);
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Scroll to top on navigation
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo(0, 0);
      });
      
      console.log('Performing auto login...');
      // Perform automatic background login immediately
      this.performAutoLogin();
    }
  }
  
  /**
   * Performs automatic login in the background
   */
  private performAutoLogin(): void {
    console.log('Starting auto login process...');
    this.autoLoginService.performAutoLogin().subscribe({
      next: (success) => {
        if (success) {
          console.log('Auto-login successful');
        } else {
          console.warn('Auto-login failed or was skipped');
        }
      },
      error: (err) => {
        console.error('Error during auto-login:', err);
      }
    });
  }
}
