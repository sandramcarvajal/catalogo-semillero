import { Routes } from '@angular/router';
import { CatalogoPageComponent } from './catalogo-page/catalogo-page.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { NoEncontradoComponent } from './pages/no-encontrado.component';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: CatalogoPageComponent, title: 'Catálogo' },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./pages/detalle-producto.component').then(
        m => m.DetalleProductoComponent
      ),
    title: 'Detalle de producto'
  },
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/carrito-page.component').then(
        m => m.CarritoPageComponent
      ),
    title: 'Mi carrito'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page.component').then(m => m.LoginPageComponent),
    title: 'Iniciar sesión'
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro-page.component').then(
        m => m.RegistroPageComponent
      ),
    title: 'Crear cuenta'
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    component: NoEncontradoComponent,
    title: 'Página no encontrada'
  }
];
