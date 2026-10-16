import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable, of, switchMap, timer } from 'rxjs';
import { UsuarioService } from '../services/usuario.service';

export function correoDisponible(): AsyncValidatorFn {
  const usuarioService = inject(UsuarioService);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    // Espera 400 ms para no consultar la API en cada tecla.
    return timer(400).pipe(
      switchMap(() => usuarioService.existeCorreo(control.value as string)),
      map((existe) => (existe ? { correoOcupado: true } : null))
    );
  };
}
