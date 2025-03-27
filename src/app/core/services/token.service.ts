import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly AUTO_LOGIN_TOKEN_KEY = 'auto_login_token';
  
  private tokenExpiryMap = new Map<string, Date>();
  private tokenRefreshInProgress = false;
  
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initFromStorage();
  }
  
  private initFromStorage(): void {
    const token = this.storageService.getItem(this.TOKEN_KEY);
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    const autoLoginToken = this.storageService.getItem(this.AUTO_LOGIN_TOKEN_KEY);
    
    if (token) {
      this.accessTokenSubject.next(token);
      this.setTokenExpiryEstimate(token);
    }
  }
  
  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }
  
  getRefreshToken(): string | null {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  getAutoLoginToken(): string | null {
    return this.storageService.getItem(this.AUTO_LOGIN_TOKEN_KEY);
  }
  
  setAccessToken(token: string): void {
    this.storageService.setItem(this.TOKEN_KEY, token);
    this.accessTokenSubject.next(token);
    this.setTokenExpiryEstimate(token);
    
    console.log('Access token updated');
  }
  
  setRefreshToken(token: string): void {
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, token);
    console.log('Refresh token updated');
  }
  
  setAutoLoginToken(token: string): void {
    this.storageService.setItem(this.AUTO_LOGIN_TOKEN_KEY, token);
    console.log('Auto login token updated');
  }
  
  clearTokens(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.accessTokenSubject.next(null);
    this.tokenExpiryMap.clear();
    
    console.log('Tokens cleared');
    // Note: we don't clear autoLoginToken here
  }
  
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    const expiry = this.tokenExpiryMap.get(token);
    if (!expiry) return false;
    
    const now = new Date();
    return expiry.getTime() <= now.getTime();
  }
  
  isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    const expiry = this.tokenExpiryMap.get(token);
    if (!expiry) return false;
    
    const now = new Date();
    const thresholdMs = minutesThreshold * 60 * 1000;
    return expiry.getTime() - now.getTime() < thresholdMs;
  }
  
  isRefreshInProgress(): boolean {
    return this.tokenRefreshInProgress;
  }
  
  setRefreshInProgress(value: boolean): void {
    this.tokenRefreshInProgress = value;
  }
  
  private setTokenExpiryEstimate(token: string): void {
    try {
      // Try to parse JWT to get expiry
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          const expiry = new Date(payload.exp * 1000);
          this.tokenExpiryMap.set(token, expiry);
          
          const minutesToExpiry = Math.round((expiry.getTime() - Date.now()) / 60000);
          console.log(`Token expires in approximately ${minutesToExpiry} minutes`);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not parse JWT token', e);
    }
    
    // If not a parseable JWT or no exp claim, estimate 1 hour expiry
    const estimatedExpiry = new Date();
    estimatedExpiry.setHours(estimatedExpiry.getHours() + 1);
    this.tokenExpiryMap.set(token, estimatedExpiry);
    console.log('Using estimated token expiry of 1 hour from now');
  }
} 