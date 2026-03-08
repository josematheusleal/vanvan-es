import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard que garante que apenas motoristas aprovados acessem as rotas de motorista.
 *
 * Verifica duas condições:
 * 1. O usuário possui role === 'DRIVER'
 * 2. O registrationStatus === 'APPROVED'
 *
 * Redirecionamentos:
 * - Não autenticado        → /login
 * - Role diferente de DRIVER → /forbidden
 * - PENDING ou REJECTED    → /driver-status
 */
export const driverGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.currentUser();
  if (user) {
    return checkDriver(user, router);
  }

  return authService.getMe().pipe(
    map(profile => {
      authService.currentUser.set(profile);
      return checkDriver(profile, router);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

function checkDriver(user: { role: string; registrationStatus?: string }, router: Router) {
  const role = user.role?.toUpperCase();

  if (role !== 'DRIVER') {
    return router.createUrlTree(['/forbidden']);
  }

  if (user.registrationStatus !== 'APPROVED') {
    return router.createUrlTree(['/driver-status']);
  }

  return true;
}
