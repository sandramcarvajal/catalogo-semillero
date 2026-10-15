import { Routes } from '@angular/router';
import { cambiosSinGuardarGuard } from '../guards/cambios-sin-guardar.guard';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminProductosComponent } from './admin-productos.component';
import { AdminUsuariosComponent } from './admin-usuarios.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      {
        path: 'productos',
        component: AdminProductosComponent,
        canDeactivate: [cambiosSinGuardarGuard]
      },
      { path: 'usuarios', component: AdminUsuariosComponent }
    ]
  }
];
