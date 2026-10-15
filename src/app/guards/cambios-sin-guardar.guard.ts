import { CanDeactivateFn } from '@angular/router';

export interface PuedeSalir {
  puedeSalir(): boolean;
}

export const cambiosSinGuardarGuard: CanDeactivateFn<PuedeSalir> = (
  componente
) => {
  return componente.puedeSalir()
    ? true
    : confirm('Tenés cambios sin guardar. ¿Salir de todos modos?');
};
