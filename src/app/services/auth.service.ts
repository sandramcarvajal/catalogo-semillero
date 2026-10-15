import { Injectable, signal } from '@angular/core';
import { Rol, Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Login simulado con LocalStorage mientras no hay backend.
  private readonly claveSesion = 'catalogo-usuario';
  private readonly claveValida = 'wposs123';

  private sesion = signal<Usuario | null>(this.leerSesion());

  // El menú y los guards leen el estado desde acá.
  readonly usuarioActual = this.sesion.asReadonly();

  iniciarSesion(usuario: string, clave: string): boolean {
    if (clave !== this.claveValida) {
      return false;
    }

    const sesion: Usuario = {
      usuario: usuario.trim() || 'invitado',
      rol: usuario.trim().toLowerCase() === 'admin' ? 'admin' : 'usuario'
    };

    localStorage.setItem(this.claveSesion, JSON.stringify(sesion));
    this.sesion.set(sesion);
    return true;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveSesion);
    this.sesion.set(null);
  }

  estaAutenticado(): boolean {
    return this.sesion() !== null;
  }

  tieneRol(rol: Rol): boolean {
    return this.sesion()?.rol === rol;
  }

  private leerSesion(): Usuario | null {
    try {
      const guardado = localStorage.getItem(this.claveSesion);

      if (guardado === null) {
        return null;
      }

      const datos: unknown = JSON.parse(guardado);

      if (
        datos !== null &&
        typeof datos === 'object' &&
        typeof (datos as Usuario).usuario === 'string' &&
        typeof (datos as Usuario).rol === 'string'
      ) {
        return datos as Usuario;
      }
    } catch (error) {
      console.error('No se pudo recuperar la sesión guardada', error);
    }

    return null;
  }
}
