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

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only intercept requests to our API
    if (!request.url.includes(apiConfig.baseUrl)) {
      return next.handle(request);
    }

    // Start a loading indicator here if needed
    // this.loadingService.show();

    // Clone the request and add common headers
    const apiRequest = request.clone({
      setHeaders: {
        'Content-Type': apiConfig.headers.contentType,
        'Accept': apiConfig.headers.accept,
        'X-App-Version': apiConfig.headers.appVersion
      }
    });

    // Pass the modified request to the next handler
    return next.handle(apiRequest).pipe(
      // Global error handling for API requests
      catchError((error: HttpErrorResponse) => {
        // Handle common error scenarios
        if (error.status === 0) {
          console.error('Network error - please check your connection');
        } else if (error.status === apiConfig.statusCodes.unauthorized) {
          console.error('Authentication error - please login again');
          // Redirect to login page or refresh token as needed
        } else if (error.status === apiConfig.statusCodes.forbidden) {
          console.error('Authorization error - you do not have permission');
        } else if (error.status === apiConfig.statusCodes.serverError) {
          console.error('Server error - please try again later');
        }

        // Forward the error to the calling component
        return throwError(() => error);
      }),
      // Always hide the loading indicator when request completes
      finalize(() => {
        // this.loadingService.hide();
      })
    );
  }
} 