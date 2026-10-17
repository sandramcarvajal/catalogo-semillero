import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminProductosComponent } from './admin-productos.component';
import { AdminUsuariosComponent } from './admin-usuarios.component';
import { FormularioProductoComponent } from './formulario-producto.component';
import { cambiosSinGuardarGuard } from '../guards/cambios-sin-guardar.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: AdminProductosComponent },
      {
        path: 'productos/nuevo',
        component: FormularioProductoComponent,
        canDeactivate: [cambiosSinGuardarGuard]
      },
      {
        path: 'productos/:id/editar',
        component: FormularioProductoComponent,
        canDeactivate: [cambiosSinGuardarGuard]
      },
      { path: 'usuarios', component: AdminUsuariosComponent }
    ]
  }
];
