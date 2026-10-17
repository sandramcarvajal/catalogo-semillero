import { AbstractControl, ValidationErrors } from '@angular/forms';

// El required no detecta espacios: un campo con "   " pasaría sin este validador.
export function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string | null;

  if (valor && valor.trim().length === 0) {
    return { soloEspacios: true };
  }

  return null;
}
