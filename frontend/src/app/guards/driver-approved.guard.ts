import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard that only allows APPROVED drivers to access the route.
 * - Non-driver users pass through (they're handled by authGuard).
 * - Drivers with PENDING or REJECTED status are redirected to /home.
 */
export const driverApprovedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // If we already have the user profile cached, check immediately
  const user = authService.currentUser();
  if (user) {
    // Only restrict drivers — non-drivers can pass
    if (user.role === 'DRIVER' && user.registrationStatus !== 'APPROVED') {
      return router.createUrlTree(['/home']);
    }
    return true;
  }

  // Otherwise fetch from backend
  return authService.getMe().pipe(
    map(profile => {
      authService.currentUser.set(profile);
      if (profile.role === 'DRIVER' && profile.registrationStatus !== 'APPROVED') {
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
