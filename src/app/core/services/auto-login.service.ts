import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { getConfigEndpoint } from '../utils/api-utils';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AutoLoginService {
  private readonly AUTO_LOGIN_TOKEN_KEY = 'auto_login_token';
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private cryptoService = inject(CryptoService);
  private apiService = inject(ApiService);

  /**
   * Performs automatic background login with predefined credentials
   */
  performAutoLogin(): Observable<boolean> {
    console.log('AutoLoginService: Starting auto login...');
    
    // Check if we already have a token from manual login or previous auto login
    if (this.authService.getAccessToken()) {
      console.log('AutoLoginService: Token already exists, skipping auto login');
      return of(true); // Already logged in
    }

    const credentials = {
      username: this.cryptoService.decrypt('b2cfreelance'),
      password: this.cryptoService.decrypt('aV7@pR!q9X#2zLmT'),
      clientId: environment.clientId,
      clientSecret: environment.clientSecret
    };

    console.log('AutoLoginService: Attempting auto login with credentials');
    
    // Using the configured API endpoint for background login - using normal login endpoint
    const endpoint = getConfigEndpoint('auth', 'login');
    return this.apiService.post<any>(endpoint, credentials).pipe(
      tap((response) => {
        console.log('AutoLoginService: Received login response', response);
        if (response?.access_token) {
          console.log('AutoLoginService: Storing access token');
          this.storageService.setItem(
            this.AUTO_LOGIN_TOKEN_KEY, 
            response.access_token
          );
          
          // Share the token with the auth service
          this.authService.setAutoLoginToken(response.access_token);
        } else {
          console.warn('AutoLoginService: Response missing access_token');
        }
      }),
      map((response) => {
        return !!response?.access_token;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error(
            'AutoLoginService: CORS error or network issue during auto-login. This may be fixed by running with proxy.',
            error
          );
        } else {
          console.error('AutoLoginService: Auto login failed:', error);
        }
        return of(false);
      })
    );
  }

  /**
   * Gets the auto login token for API calls
   */
  getAutoLoginToken(): string | null {
    return this.storageService.getItem(this.AUTO_LOGIN_TOKEN_KEY);
  }
}
