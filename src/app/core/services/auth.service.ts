import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
} from '../models/user.model';
import { StorageService } from './storage.service';
import { getConfigEndpoint } from '../utils/api-utils';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenProvider } from './api.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements TokenProvider {
  private readonly USER_KEY = 'user_data';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
  });

  public authState$ = this.authStateSubject.asObservable();
  public currentUser$ = this.authState$.pipe(map((state) => state.user));
  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isLoggedIn)
  );
  public authError$ = this.authState$.pipe(map((state) => state.error));

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storageService: StorageService,
    private tokenService: TokenService
  ) {
    this.initializeAuthState();
    
    // Debug auth state on startup
    setTimeout(() => this.debugAuthState(), 1000);
  }

  private initializeAuthState(): void {
    const token = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    const userDataStr = this.storageService.getItem(this.USER_KEY);
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr) as User;
        this.authStateSubject.next({
          user: userData,
          accessToken: token,
          refreshToken,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        });
      } catch (e) {
        // Handle invalid user data in storage
        this.clearLocalStorage();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.setLoading(true);
    credentials.clientId = environment.clientId;
    credentials.clientSecret = environment.clientSecret;

    console.log('Login attempt with credentials:', {
      username: credentials.username,
      hasPassword: !!credentials.password,
      clientId: credentials.clientId
    });

    const endpoint = getConfigEndpoint('auth', 'login');
    return this.apiService.post<any>(endpoint, credentials).pipe(
      tap((response) => {
        console.log('Login response received:', {
          hasAccessToken: !!response.access_token || !!response.accessToken,
          hasRefreshToken: !!response.refresh_token || !!response.refreshToken
        });

        // Handle different API response formats
        const accessToken = response.access_token || response.accessToken;
        const refreshToken = response.refresh_token || response.refreshToken;
        
        this.setSession(
          response as User,
          accessToken,
          refreshToken
        );
        this.setLoading(false);
      }),
      map((response) => response as User),
      catchError((error) => {
        console.error('Login error:', error);
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterData): Observable<User> {
    this.setLoading(true);
    const endpoint = getConfigEndpoint('auth', 'register');

    return this.apiService.post<{ user: User; accessToken: string; refreshToken: string }>(
      endpoint, data
    ).pipe(
      tap((response) => {
        const { user, accessToken, refreshToken } = response;
        this.setSession(user, accessToken, refreshToken);
        this.setLoading(false);
      }),
      map((response) => response.user),
      catchError((error) => {
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const refreshToken = this.authStateSubject.value.refreshToken;

    // Optional: Send logout request to invalidate token on server
    if (refreshToken) {
      const endpoint = getConfigEndpoint('auth', 'logout');
      this.apiService.post(endpoint, { refreshToken })
        .pipe(
          catchError(() => of(null)) // Ignore logout errors
        )
        .subscribe();
    }

    this.clearLocalStorage();
    this.authStateSubject.next({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
    });

    this.router.navigate(['/']);
  }

  refreshToken(): Observable<string> {
    // Set flag in token service
    this.tokenService.setRefreshInProgress(true);
    
    // Get tokens
    const refreshToken = this.authStateSubject.value.refreshToken;
    const autoLoginToken = this.tokenService.getAutoLoginToken();
    
    // If we don't have a refresh token, try to use autoLogin token instead
    if (!refreshToken && autoLoginToken) {
      console.log('Using autoLogin token instead of refresh token');
      const currentState = this.authStateSubject.value;
      
      // Set the autoLogin token as the current access token
      this.authStateSubject.next({
        ...currentState,
        accessToken: autoLoginToken,
      });
      
      // Update token service
      this.tokenService.setAccessToken(autoLoginToken);
      
      // Reset refresh in progress flag
      this.tokenService.setRefreshInProgress(false);
      
      // Return the autoLogin token
      return of(autoLoginToken);
    }

    // If no refresh token and no autoLogin token, return error
    if (!refreshToken && !autoLoginToken) {
      this.tokenService.setRefreshInProgress(false);
      return throwError(() => new Error('No refresh token or autoLogin token available'));
    }

    // If we have a refresh token, proceed with normal token refresh
    if (refreshToken) {
      // We need to bypass the ApiService since it uses HTTP interceptors which could lead to circular calls
      // Instead we'll use HttpClient directly through a custom endpoint that won't be intercepted
      const endpoint = getConfigEndpoint('auth', 'refreshToken');
      
      // Create request data
      const refreshData = { 
        refreshToken,
        clientId: environment.clientId,
        clientSecret: environment.clientSecret
      };

      // Make a direct HTTP call to avoid the interceptor loop
      return this.apiService.post<{ accessToken: string; refreshToken: string }>(
        endpoint, refreshData
      ).pipe(
        tap((response) => {
          // Update state with new tokens
          const currentState = this.authStateSubject.value;
          this.authStateSubject.next({
            ...currentState,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          // Update token service
          this.tokenService.setAccessToken(response.accessToken);
          this.tokenService.setRefreshToken(response.refreshToken);
          
          console.log('Token refreshed successfully');
        }),
        map((response) => response.accessToken),
        catchError((error) => {
          console.error('Error refreshing token:', error);
          
          // If refresh token fails, try autoLogin token as fallback
          if (autoLoginToken) {
            console.log('Refresh token failed, using autoLogin token as fallback');
            const currentState = this.authStateSubject.value;
            
            this.authStateSubject.next({
              ...currentState,
              accessToken: autoLoginToken,
            });
            
            this.tokenService.setAccessToken(autoLoginToken);
            return of(autoLoginToken);
          }
          
          // If no autoLogin token either, logout the user
          this.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          // Always reset the refresh in progress flag
          this.tokenService.setRefreshInProgress(false);
        })
      );
    }

    // This line shouldn't be reached, but TypeScript needs it for proper type checking
    this.tokenService.setRefreshInProgress(false);
    return of('');
  }

  // Implement the TokenProvider interface method
  getToken(): string | null {
    // First try to get the regular user token
    const userToken = this.authStateSubject.value.accessToken;
    
    // If no user token, use the auto-login token
    return userToken || this.tokenService.getAutoLoginToken();
  }

  /**
   * Gets the access token from either regular auth or auto-login if available
   */
  getAccessToken(): string | null {
    return this.getToken();
  }

  /**
   * Set the auto-login token 
   */
  setAutoLoginToken(token: string): void {
    this.tokenService.setAutoLoginToken(token);
  }

  private setSession(
    user: User,
    accessToken: string,
    refreshToken: string | null
  ): void {
    this.storageService.setItem(this.USER_KEY, JSON.stringify(user));

    if (accessToken) {
      this.tokenService.setAccessToken(accessToken);
    }
    
    if (refreshToken) {
      this.tokenService.setRefreshToken(refreshToken);
    }

    this.authStateSubject.next({
      user,
      accessToken,
      refreshToken,
      isLoggedIn: true,
      isLoading: false,
      error: null,
    });
  }

  private clearLocalStorage(): void {
    this.tokenService.clearTokens();
    this.storageService.removeItem(this.USER_KEY);
    // Don't clear auto-login token on regular logout
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading,
      error: isLoading ? null : currentState.error,
    });
  }

  private handleAuthError(error: any): void {
    let errorMessage = 'Authentication failed';
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Check network connection or CORS settings.';
        console.error('CORS error during authentication. This may be fixed by running with proxy.', error);
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText || errorMessage}`;
      }
    }
    
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading: false,
      error: errorMessage,
    });
  }

  /**
   * Debug the current authentication state
   */
  debugAuthState(): void {
    const token = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    const autoLoginToken = this.tokenService.getAutoLoginToken();
    const userDataStr = this.storageService.getItem(this.USER_KEY);
    
    console.log('Current Auth State:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasAutoLoginToken: !!autoLoginToken,
      hasUserData: !!userDataStr,
      isLoggedIn: this.authStateSubject.value.isLoggedIn
    });
    
    // Token provider check
    console.log('Token provider check:', {
      getToken: !!this.getToken()
    });
  }
}
