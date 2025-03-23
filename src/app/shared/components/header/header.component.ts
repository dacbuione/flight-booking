import { Component, OnInit, inject, signal, DestroyRef, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  
  isLoggedIn = signal(false);
  isMobileMenuOpen = signal(false);
  userName = signal('');
  userEmail = signal('');
  activeDropdown = signal<string | null>(null);
  
  constructor() {
    // Get auth state from AuthService
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuthenticated => {
        this.isLoggedIn.set(isAuthenticated);
        
        if (isAuthenticated) {
          this.loadUserData();
        }
      });
  }
  
  ngOnInit(): void {
    // Close mobile menu when route changes
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isMobileMenuOpen.set(false);
      });
      
    // Add scroll event listener to handle header styles on scroll only in browser environment
    if (this.isBrowser) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
    
    // Prevent body scrolling when mobile menu is open - only in browser environment
    if (this.isBrowser) {
      if (this.isMobileMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
  
  toggleSubMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isBrowser) return;
    
    const target = event.currentTarget as HTMLElement;
    const parentItem = target.closest('.nav-item');
    const submenu = parentItem?.querySelector('.submenu');
    
    if (submenu) {
      submenu.classList.toggle('active');
    }
    
    // Close other submenus
    const allSubmenus = document.querySelectorAll('.submenu.active');
    allSubmenus.forEach(menu => {
      if (menu !== submenu) {
        menu.classList.remove('active');
      }
    });
  }
  
  toggleMobileSubMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isBrowser) return;
    
    const target = event.currentTarget as HTMLElement;
    const parentItem = target.closest('.mobile-nav-item');
    const submenu = parentItem?.nextElementSibling;
    
    if (submenu && submenu.classList.contains('mobile-submenu')) {
      submenu.classList.toggle('active');
      target.querySelector('i')?.classList.toggle('rotate');
    }
  }
  
  toggleUserMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isBrowser) return;
    
    if (this.activeDropdown() === 'userMenu') {
      this.activeDropdown.set(null);
    } else {
      this.activeDropdown.set('userMenu');
      // Close any open mobile menu if open
      this.isMobileMenuOpen.set(false);
    }
  }
  
  handleScroll(): void {
    if (!this.isBrowser) return;
    
    const header = document.querySelector('.header-main');
    if (window.scrollY > 50) {
      header?.classList.add('header-scrolled');
    } else {
      header?.classList.remove('header-scrolled');
    }
  }
  
  loadUserData(): void {
    // Get user data from auth service
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: User | null) => {
        if (user) {
          this.userName.set(user.firstName || 'User');
          this.userEmail.set(user.email || '');
        }
      });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  
  // Add this method to close all menus
  closeAllMenus(): void {
    if (!this.isBrowser) return;
    
    this.activeDropdown.set(null);
    this.isMobileMenuOpen.set(false);
    
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }
  
  // Listen for clicks on document to close dropdowns
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser) return;
    
    const target = event.target as HTMLElement;
    
    // Skip if clicking inside any dropdown or dropdown toggle
    if (
      target.closest('.dropdown-toggle') ||
      target.closest('.dropdown-panel') ||
      target.closest('.avatar-button') ||
      target.closest('.user-dropdown') ||
      target.closest('.mobile-menu-toggle') ||
      target.closest('.mobile-menu-content')
    ) {
      return;
    }
    
    this.closeAllMenus();
  }
} 