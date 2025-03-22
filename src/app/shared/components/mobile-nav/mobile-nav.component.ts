import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss']
})
export class MobileNavComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  isMenuOpen = signal(false);
  isLoggedIn = signal(false);
  
  ngOnInit(): void {
    // Get auth state from AuthService
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed())
      .subscribe(isAuthenticated => {
        this.isLoggedIn.set(isAuthenticated);
      });
  }
  
  toggleMenu() {
    this.isMenuOpen.update(current => !current);
  }
  
  closeMenu() {
    this.isMenuOpen.set(false);
  }
  
  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
