import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  activeSubmenuId: string | null = null;
  currentRoute = '';
  
  // User data
  isLoggedIn = false;
  currentUser: User | null = null;

  navigationItems = [
    {
      id: 'flights',
      icon: 'fa-solid fa-plane-departure',
      title: 'Flights',
      hasSubmenu: true,
      links: [
        { icon: 'fa-solid fa-magnifying-glass', title: 'Find Flights', route: '/flights' },
        { icon: 'fa-solid fa-calendar-days', title: 'Flight Schedule', route: '/schedule' },
        { icon: 'fa-solid fa-ticket', title: 'Booking Status', route: '/booking-status' },
        { icon: 'fa-solid fa-check-to-slot', title: 'Check-in Online', route: '/check-in' }
      ]
    },
    {
      id: 'tours',
      icon: 'fa-solid fa-map-location-dot',
      title: 'Tours & Activities',
      hasSubmenu: true,
      links: [
        { icon: 'fa-solid fa-mountain-sun', title: 'Adventure Tours', route: '/tours/adventure' },
        { icon: 'fa-solid fa-landmark', title: 'Cultural Experiences', route: '/tours/cultural' },
        { icon: 'fa-solid fa-umbrella-beach', title: 'Beach Getaways', route: '/tours/beach' },
        { icon: 'fa-solid fa-utensils', title: 'Food & Culinary', route: '/tours/culinary' }
      ]
    },
    {
      id: 'hotels',
      icon: 'fa-solid fa-hotel',
      title: 'Hotels',
      hasSubmenu: true,
      links: [
        { icon: 'fa-solid fa-bed', title: 'Find Hotels', route: '/hotels' },
        { icon: 'fa-solid fa-star', title: 'Luxury Stays', route: '/hotels/luxury' },
        { icon: 'fa-solid fa-percent', title: 'Deals & Promotions', route: '/hotels/deals' },
        { icon: 'fa-solid fa-key', title: 'Manage Booking', route: '/hotels/manage' }
      ]
    },
    {
      id: 'news',
      icon: 'fa-solid fa-newspaper',
      title: 'News & Blog',
      route: '/blog',
      hasSubmenu: false
    },
    {
      id: 'promotions',
      icon: 'fa-solid fa-gift',
      title: 'Promotions',
      route: '/promotions',
      hasSubmenu: false
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      // Close mobile menu when navigating
      this.isMobileMenuOpen = false;
    });
    
    // Check login status from auth service
    this.authService.isAuthenticated$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
    
    // Get user details if logged in
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Close any open submenu when toggling the mobile menu
    this.activeSubmenuId = null;
    
    // Prevent body scrolling when menu is open
    if (this.isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }
  
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSubmenu(id: string): void {
    this.activeSubmenuId = this.activeSubmenuId === id ? null : id;
  }
  
  isSubmenuActive(id: string): boolean {
    return this.activeSubmenuId === id;
  }
  
  isRouteActive(route: string): boolean {
    return this.currentRoute === route;
  }
  
  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.firstName || this.currentUser.email.split('@')[0];
  }
  
  getUserEmail(): string {
    return this.currentUser?.email || '';
  }
  
  login(): void {
    this.router.navigate(['/auth/login']);
    this.isMobileMenuOpen = false;
  }
  
  register(): void {
    this.router.navigate(['/auth/register']);
    this.isMobileMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMobileMenuOpen = false;
  }
} 