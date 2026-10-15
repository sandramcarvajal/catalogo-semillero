import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }

  // Sin sesión: mandamos al login y guardamos a dónde quería ir.
  return router.createUrlTree(['/login'], {
    queryParams: { volverA: estado.url }
  });
};
