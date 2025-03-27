import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, EMPTY } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { apiConfig } from '../config/api.config';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
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
    
    // Check for forced logout flag
    const needsRelogin = localStorage.getItem('force_relogin');
    if (needsRelogin === 'true') {
      localStorage.removeItem('force_relogin');
      this.authService.logout();
      this.router.navigate(['/login'], { 
        queryParams: { 
          error: 'Your session has expired. Please log in again.'
        } 
      });
      return throwError(() => new Error('Session expired. Please log in again.'));
    }

    // Check if token is already expired or missing
    if (this.tokenService.isTokenExpired() || !this.authService.getAccessToken()) {
      console.warn(`Authentication token expired or missing for request to: ${request.url}`);
      
      // Attempt token refresh or auto-login before continuing with the request
      if (!this.tokenService.isRefreshInProgress()) {
        console.log('Token expired - attempting refresh before proceeding with request');
        return this.refreshAndRetry(request, next);
      }
    }

    // Add token to request if available
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    } else {
      console.warn(`Authentication token still missing after refresh check for: ${request.url}`);
      
      // Log current auth state to diagnose issues
      console.log('Current auth state:', {
        hasToken: !!token,
        isRefreshing: this.tokenService.isRefreshInProgress(),
        isTokenExpired: this.tokenService.isTokenExpired()
      });
    }

    // Check if token is expiring soon - if so, refresh it proactively
    if (this.tokenService.isTokenExpiringSoon(5) && !this.tokenService.isRefreshInProgress()) {
      console.log('Token is expiring soon, refreshing proactively');
      
      // Continue with the current request using existing token
      // but also initiate a token refresh in the background for future requests
      this.authService.refreshToken().subscribe({
        next: (newToken) => console.log('Successfully refreshed token in background'),
        error: (err) => console.error('Background token refresh failed:', err)
      });
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          // Handle 401 Unauthorized errors with token refresh
          if (error.status === 401) {
            console.log('Got 401 error response, attempting to recover');
            
            // Check for JWT expiration specific error
            if (error.error && 
                typeof error.error === 'object' && 
                'error_description' in error.error && 
                error.error.error_description.includes('expired')) {
                  
              console.log('JWT explicitly expired, forcing relogin');
              localStorage.setItem('force_relogin', 'true');
              
              // Reload the page to apply the force_relogin flag
              window.location.reload();
              return EMPTY;
            }
            
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
    console.log('Handling 401 error - token likely expired');
    
    // Force navigation to login page and clear invalid token
    this.authService.logout();
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: this.router.url,
        error: 'Your session has expired. Please log in again.'
      } 
    });
    
    // Return an error to stop the current request flow
    return throwError(() => new Error('Authentication required'));
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
          console.error('Token refresh failed, attempting automatic re-login:', error);
          
          // Try automatic re-login as a last resort
          return this.authService.automaticReLogin().pipe(
            switchMap(token => {
              this.refreshTokenSubject.next(token);
              console.log('Automatic re-login successful, retrying request with new token');
              return next.handle(this.addToken(request, token));
            }),
            catchError(reLoginError => {
              // At this point, both token refresh and re-login have failed
              console.error('Both token refresh and automatic re-login failed:', reLoginError);
              this.authService.logout();
              return throwError(() => new Error('Session expired. Please log in again.'));
            }),
            finalize(() => {
              this.tokenService.setRefreshInProgress(false);
            })
          );
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