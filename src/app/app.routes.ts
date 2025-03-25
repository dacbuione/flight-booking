import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { BookingComponent } from './features/booking/booking.component';
import { ProfileComponent } from './features/profile/profile.component';
import { FrequentFlyerComponent } from './features/frequent-flyer/frequent-flyer.component';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { BOOKING_ROUTES } from './features/booking/booking.routes';
import { PROFILE_ROUTES } from './features/profile/profile.routes';
import { authGuard } from './core/guards/auth.guard';
import { NewsComponent } from './features/news/news.component';
import { NewsDetailComponent } from './features/news/news-detail/news-detail.component';

export const routes: Routes = [
  // Home route
  {
    path: '',
    component: HomeComponent,
    title: 'Trang chủ - Flight Booking'
  },
  
  // Auth routes
  {
    path: 'auth',
    children: AUTH_ROUTES
  },
  
  // Flight search route
  {
    path: 'flight-search',
    loadComponent: () => import('./features/flight-search/flight-search.component').then(c => c.FlightSearchComponent),
    title: 'Tìm kiếm chuyến bay - Flight Booking'
  },
  
  // Flight listing route
  {
    path: 'flight-listing',
    loadComponent: () => import('./features/flight-listing/flight-listing.component').then(c => c.FlightListingComponent),
    title: 'Danh sách chuyến bay - Flight Booking'
  },
  
  // Flights route
  {
    path: 'flights',
    loadComponent: () => import('./features/flights/flights.component').then(c => c.FlightsComponent),
    title: 'Thông tin chuyến bay - Flight Booking'
  },
  
  // Tours route
  {
    path: 'tours',
    loadComponent: () => import('./features/tours/tours.component').then(m => m.ToursComponent),
    title: 'Tours du lịch - Flight Booking'
  },
  
  // Tour detail route
  {
    path: 'tours/:id',
    loadComponent: () => import('./features/tours/tour-detail/tour-detail.component').then(m => m.TourDetailComponent),
    title: 'Chi tiết tour - Flight Booking'
  },
  
  // Hotels route
  {
    path: 'hotels',
    loadComponent: () => import('./features/hotels/hotels.component').then(m => m.HotelsComponent),
    title: 'Khách sạn - Flight Booking'
  },
  
  // Hotel detail route
  {
    path: 'hotels/:id',
    loadComponent: () => import('./features/hotels/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent),
    title: 'Chi tiết khách sạn'
  },
  
  // Booking routes
  {
    path: 'booking',
    children: BOOKING_ROUTES,
    canActivate: [authGuard]
  },
  
  // Profile routes
  {
    path: 'profile',
    children: PROFILE_ROUTES,
    canActivate: [authGuard]
  },
  
  // Frequent Flyer route
  {
    path: 'frequent-flyer',
    component: FrequentFlyerComponent,
    title: 'Khách hàng thân thiết - Flight Booking'
  },
  
  // Promotions route
  {
    path: 'promotions',
    loadComponent: () => import('./features/promotions/promotions.component').then(c => c.PromotionsComponent),
    title: 'Khuyến mãi - Flight Booking'
  },
  
  // News routes
  {
    path: 'news',
    component: NewsComponent,
    title: 'Tin tức hàng không - Flight Booking'
  },
  {
    path: 'news/:id',
    component: NewsDetailComponent,
    title: 'Chi tiết tin tức - Flight Booking'
  },
  
  // Not found
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent),
    title: 'Không tìm thấy trang - Flight Booking'
  }
];
