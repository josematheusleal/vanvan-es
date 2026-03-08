import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard genérico de role.
 * Lê as roles permitidas de route.data['roles'] (string[]).
 * Se o usuário não possuir uma das roles permitidas, redireciona para /forbidden.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), permite a navegação — a checagem real acontece no client
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  // Se não há roles configuradas, bloqueia por segurança
  if (allowedRoles.length === 0) {
    return router.createUrlTree(['/forbidden']);
  }

  // Se já temos o perfil em cache, verifica imediatamente
  const user = authService.currentUser();
  if (user) {
    const userRole = user.role?.toLowerCase();
    if (allowedRoles.includes(userRole)) {
      return true;
    }
    return router.createUrlTree(['/forbidden']);
  }

  // Caso contrário, busca o perfil no backend
  return authService.getMe().pipe(
    map(profile => {
      authService.currentUser.set(profile);
      const userRole = profile.role?.toLowerCase();
      if (allowedRoles.includes(userRole)) {
        return true;
      }
      return router.createUrlTree(['/forbidden']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
