import { FormControl } from '@angular/forms';
import { noSoloEspacios } from './no-solo-espacios.validator';

describe('noSoloEspacios', () => {
  it('acepta un texto con contenido', () => {
    expect(noSoloEspacios(new FormControl('Notebook'))).toBeNull();
  });

  it('rechaza un texto compuesto solo de espacios', () => {
    expect(noSoloEspacios(new FormControl('   '))).toEqual({ soloEspacios: true });
  });

  it('no marca error cuando el campo está vacío', () => {
    expect(noSoloEspacios(new FormControl(''))).toBeNull();
  });
});
