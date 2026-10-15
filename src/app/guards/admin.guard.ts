import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Si no es admin no hay match, así que el chunk de /admin ni se descarga.
export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.tieneRol('admin')
    ? true
    : router.parseUrl('/productos');
};
