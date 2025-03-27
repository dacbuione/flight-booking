import {
  Component,
  inject,
  signal,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MobileNavComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isLoggedIn: boolean | null = null;
  currentUser = signal<User | null>(null);
  isDropdownOpen = false;

  constructor() {
    // Get auth state from AuthService
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isAuthenticated) => {
        setTimeout(() => {
          this.isLoggedIn = isAuthenticated;
        }, 1000);
      });

    // Get current user data
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser.set(user);
      });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.user-account-dropdown');
    if (dropdown && !dropdown.contains(target) && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  userName() {
    const user = this.currentUser();
    if (!user) return 'User';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else {
      return user.email?.split('@')[0] || 'Finn';
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false;
  }
}
