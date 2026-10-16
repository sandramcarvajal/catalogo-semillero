import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador de grupo: exige que "clave" y "confirmacion" tengan el mismo valor.
 * Va en el FormGroup, no en un campo suelto.
 */
export function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  const clave = grupo.get('clave')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;

  return clave === confirmacion ? null : { clavesDistintas: true };
}
