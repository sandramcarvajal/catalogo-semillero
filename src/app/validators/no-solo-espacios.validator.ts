import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Rechaza textos compuestos únicamente por espacios en blanco.
 * Un campo con "   " pasa `required`, así que este validador cubre ese caso.
 */
export function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string | null;

  if (valor && valor.trim().length === 0) {
    return { soloEspacios: true };
  }

  return null;
}
