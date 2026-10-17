import { AbstractControl, ValidationErrors } from '@angular/forms';

// Va en el FormGroup, no en cada campo por separado.
export function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  const clave = grupo.get('clave')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;

  return clave === confirmacion ? null : { clavesDistintas: true };
}
