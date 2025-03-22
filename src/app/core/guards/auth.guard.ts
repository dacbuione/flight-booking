import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }
      
      return router.createUrlTree(['/auth/login']);
    })
  );
}; 