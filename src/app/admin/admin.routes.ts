import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminProductosComponent } from './admin-productos.component';
import { AdminUsuariosComponent } from './admin-usuarios.component';
import { FormularioProductoComponent } from './formulario-producto.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'productos/nuevo', component: FormularioProductoComponent },
      { path: 'productos/:id/editar', component: FormularioProductoComponent },
      { path: 'usuarios', component: AdminUsuariosComponent }
    ]
  }
];
