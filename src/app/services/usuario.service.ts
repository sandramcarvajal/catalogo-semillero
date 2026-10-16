import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearUsuario, DisponibilidadCorreo, UsuarioRegistrado } from '../models/registro';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  existeCorreo(correo: string): Observable<boolean> {
    return this.http
      .post<DisponibilidadCorreo>(`${this.apiUrl}/is-available`, {
        email: correo
      })
      .pipe(map((respuesta) => !respuesta.isAvailable));
  }

  crear(usuario: CrearUsuario): Observable<UsuarioRegistrado> {
    return this.http.post<UsuarioRegistrado>(this.apiUrl, usuario);
  }
}
