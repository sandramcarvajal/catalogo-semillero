import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent {
  // Datos quemados, todavía no hay endpoint de usuarios.
  usuarios: Usuario[] = [
    { usuario: 'admin', rol: 'admin' },
    { usuario: 'sandra', rol: 'usuario' },
    { usuario: 'gabriel', rol: 'usuario' },
    { usuario: 'sofia', rol: 'usuario' }
  ];
}
