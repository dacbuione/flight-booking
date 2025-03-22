import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthState, LoginCredentials, RegisterData } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public currentUser$ = this.authState$.pipe(map(state => state.user));
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isLoggedIn));
  public authError$ = this.authState$.pipe(map(state => state.error));

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.storageService.getItem('token');
    if (token) {
      // Xử lý khi có token
      // ...
    } else {
      // Xử lý khi không có token
      // ...
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.setLoading(true);
    
    return this.http.post<{ user: User; accessToken: string; refreshToken: string }>(
      `${this.API_URL}/login`, 
      credentials
    ).pipe(
      tap(response => {
        const { user, accessToken, refreshToken } = response;
        this.setSession(user, accessToken, refreshToken);
        this.setLoading(false);
      }),
      map(response => response.user),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterData): Observable<User> {
    this.setLoading(true);
    
    return this.http.post<{ user: User; accessToken: string; refreshToken: string }>(
      `${this.API_URL}/register`, 
      data
    ).pipe(
      tap(response => {
        const { user, accessToken, refreshToken } = response;
        this.setSession(user, accessToken, refreshToken);
        this.setLoading(false);
      }),
      map(response => response.user),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const refreshToken = this.authStateSubject.value.refreshToken;
    
    // Optional: Send logout request to invalidate token on server
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken })
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
      error: null
    });
    
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.authStateSubject.value.refreshToken;
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.API_URL}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => {
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
        
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      }),
      map(response => response.accessToken),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  private setSession(user: User, accessToken: string, refreshToken: string | null): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    this.authStateSubject.next({
      user,
      accessToken,
      refreshToken,
      isLoggedIn: true,
      isLoading: false,
      error: null
    });
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading,
      error: isLoading ? null : currentState.error
    });
  }

  private handleAuthError(error: any): void {
    const errorMessage = error.error?.message || 'Authentication failed';
    const currentState = this.authStateSubject.value;
    
    this.authStateSubject.next({
      ...currentState,
      isLoading: false,
      error: errorMessage
    });
  }
} 