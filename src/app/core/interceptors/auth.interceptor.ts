import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { apiConfig } from '../config/api.config';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for auth endpoints to avoid infinite loops
    if (request.url.includes(`/api/${apiConfig.endpoints.auth.login}`) || 
        request.url.includes(`/api/${apiConfig.endpoints.auth.refreshToken}`) || 
        request.url.includes(`/api/${apiConfig.endpoints.auth.register}`)) {
      console.log('Skipping auth interceptor for auth endpoint:', request.url);
      return next.handle(request);
    }

    // Only intercept requests to our API - use the config baseUrl
    if (!request.url.startsWith('/api')) {
      return next.handle(request);
    }

    // Add token to request if available
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    } else {
      console.warn(`Authentication token missing for request to: ${request.url}`);
      
      // Log current auth state to diagnose issues
      console.log('Current auth state:', {
        hasToken: !!token,
        isRefreshing: this.tokenService.isRefreshInProgress()
      });
      
      // Try to refresh the token immediately if missing
      if (!this.tokenService.isRefreshInProgress()) {
        return this.refreshAndRetry(request, next);
      }
    }

    // Check if token is expiring soon - if so, refresh it proactively
    if (this.tokenService.isTokenExpiringSoon(5) && !this.tokenService.isRefreshInProgress()) {
      console.log('Token is expiring soon, refreshing proactively');
      return this.refreshAndRetry(request, next);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          // Handle 401 Unauthorized errors with token refresh
          if (error.status === 401) {
            return this.handle401Error(request, next);
          }
          
          // Handle 403 Forbidden errors (may require additional logic)
          if (error.status === 403) {
            console.error('Forbidden access - insufficient permissions');
          }
        }
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.refreshAndRetry(request, next);
  }

  private refreshAndRetry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.tokenService.isRefreshInProgress()) {
      this.tokenService.setRefreshInProgress(true);
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(token => {
          this.refreshTokenSubject.next(token);
          
          // Clone the original request with the new token
          return next.handle(this.addToken(request, token));
        }),
        catchError(error => {
          // At this point, refreshToken has already tried auto-login if appropriate
          // If we still get an error, we need to log out
          console.error('Token refresh failed completely, redirecting to login');
          this.authService.logout();
          return throwError(() => new Error('Session expired. Please log in again.'));
        })
      );
    } else {
      // Wait until the token is refreshed
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    // Don't modify headers that already have Authorization
    if (request.headers.has('Authorization')) {
      return request;
    }
    
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
} 