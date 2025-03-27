import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { apiConfig } from '../config/api.config';
import { TokenService } from '../services/token.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only intercept requests to our API
    if (!request.url.startsWith('/api')) {
      return next.handle(request);
    }

    // Start a loading indicator here if needed
    // this.loadingService.show();

    // Get access token
    const token = this.tokenService.getAccessToken();
    
    console.log('API Interceptor processing request:', {
      url: request.url,
      method: request.method,
      hasToken: !!token,
      hasAuthHeader: request.headers.has('Authorization')
    });

    // Clone the request and add common headers
    const headers: Record<string, string> = {
      'Content-Type': apiConfig.headers.contentType,
      'Accept': apiConfig.headers.accept,
      'X-App-Version': apiConfig.headers.appVersion
    };

    // Add Authorization header if token exists
    if (token && !request.headers.has('Authorization')) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding Authorization header with token');
    }

    const apiRequest = request.clone({
      setHeaders: headers
    });
    
    // Log the modified request headers
    console.log('Final request headers:', 
      Array.from(apiRequest.headers.keys()).map(key => 
        `${key}: ${apiRequest.headers.get(key)}`
      )
    );

    // Pass the modified request to the next handler
    return next.handle(apiRequest).pipe(
      // Global error handling for API requests
      catchError((error: HttpErrorResponse) => {
        // Handle common error scenarios
        if (error.status === 0) {
          console.error('Network error - please check your connection');
        } 
        // Skip 401 errors - these are handled by AuthInterceptor, but log for debugging
        else if (error.status === apiConfig.statusCodes.unauthorized) {
          console.error('API Interceptor: 401 Unauthorized error detected for URL:', request.url, 'This will be handled by AuthInterceptor');
        }
        else if (error.status === apiConfig.statusCodes.forbidden) {
          console.error('Authorization error - you do not have permission');
        } else if (error.status === apiConfig.statusCodes.serverError) {
          console.error('Server error - please try again later');
        }

        // Forward the error to the calling component or to the next interceptor
        return throwError(() => error);
      }),
      // Always hide the loading indicator when request completes
      finalize(() => {
        // this.loadingService.hide();
      })
    );
  }
} 