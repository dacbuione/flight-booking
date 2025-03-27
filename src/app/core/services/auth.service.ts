import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly AUTO_LOGIN_TOKEN_KEY = 'auto_login_token';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
  });

  // Separate token for auto-login functionality
  private autoLoginToken: string | null = null;

  public authState$ = this.authStateSubject.asObservable();
  public currentUser$ = this.authState$.pipe(map((state) => state.user));
  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isLoggedIn)
  );
  public authError$ = this.authState$.pipe(map((state) => state.error));

  constructor(
    private apiService: ApiService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.storageService.getItem(this.TOKEN_KEY);
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    const userDataStr = this.storageService.getItem(this.USER_KEY);
    
    // Initialize auto-login token if it exists
    this.autoLoginToken = this.storageService.getItem(this.AUTO_LOGIN_TOKEN_KEY);

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

    const endpoint = getConfigEndpoint('auth', 'login');
    return this.apiService.post<any>(endpoint, credentials).pipe(
      tap((response) => {
        this.setSession(
          response as User,
          response.access_token,
          response.refresh_token
        );
        this.setLoading(false);
      }),
      map((response) => response as User),
      catchError((error) => {
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
    const refreshToken = this.authStateSubject.value.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const endpoint = getConfigEndpoint('auth', 'refreshToken');
    return this.apiService.post<{ accessToken: string; refreshToken: string }>(
      endpoint, { refreshToken }
    ).pipe(
      tap((response) => {
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
        this.storageService.setItem(
          this.REFRESH_TOKEN_KEY,
          response.refreshToken
        );
      }),
      map((response) => response.accessToken),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets the access token from either regular auth or auto-login if available
   */
  getAccessToken(): string | null {
    // First try to get the regular user token
    const userToken = this.authStateSubject.value.accessToken;
    
    // If no user token, use the auto-login token
    return userToken || this.autoLoginToken;
  }

  /**
   * Set the auto-login token 
   */
  setAutoLoginToken(token: string): void {
    this.autoLoginToken = token;
    this.storageService.setItem(this.AUTO_LOGIN_TOKEN_KEY, token);
  }

  private setSession(
    user: User,
    accessToken: string,
    refreshToken: string | null
  ): void {
    this.storageService.setItem(this.TOKEN_KEY, accessToken);
    this.storageService.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      this.storageService.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
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
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
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
}
