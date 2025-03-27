import { Injectable, PLATFORM_ID, Inject, InjectionToken } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Create injection tokens for browser APIs
export const LOCAL_STORAGE = new InjectionToken<Storage>('LOCAL_STORAGE');
export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE');

/**
 * A service that provides safe access to browser storage APIs
 * Works in both browser and server environments
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;
  private localStorage: Storage | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only access localStorage in browser environment
    if (this.isBrowser) {
      this.localStorage = window.localStorage;
    }
  }

  getItem(key: string): string | null {
    if (this.isBrowser && this.localStorage) {
      return this.localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser && this.localStorage) {
      this.localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser && this.localStorage) {
      this.localStorage.removeItem(key);
    }
  }
} 