import { FormControl, FormGroup } from '@angular/forms';
import { clavesIguales } from './claves-iguales.validator';

describe('clavesIguales', () => {
  it('acepta cuando las claves coinciden', () => {
    const grupo = new FormGroup({
      clave: new FormControl('wposs123'),
      confirmacion: new FormControl('wposs123')
    });

    expect(clavesIguales(grupo)).toBeNull();
  });

  it('devuelve error cuando las claves no coinciden', () => {
    const grupo = new FormGroup({
      clave: new FormControl('wposs123'),
      confirmacion: new FormControl('otraClave')
    });

    expect(clavesIguales(grupo)).toEqual({ clavesDistintas: true });
  });
});
