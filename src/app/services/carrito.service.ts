
import { computed, Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly claveStorage = 'catalogo-carrito';

  private productos = signal<Producto[]>([]);

  // El componente puede consultar el carrito, pero no modificarlo directamente.
  readonly carrito = this.productos.asReadonly();

  readonly cantidad = computed(() => this.productos().length);

  readonly total = computed(() =>
    this.productos().reduce(
      (acumulado, producto) => acumulado + producto.price,
      0
    )
  );

  constructor() {
    this.cargarDesdeStorage();
  }

  agregar(producto: Producto): void {
    this.productos.update(actuales => [...actuales, producto]);
    this.guardarEnStorage();
  }

  quitar(id: number): void {
    const indice = this.productos().findIndex(
      producto => producto.id === id
    );

    if (indice === -1) {
      return;
    }

    this.productos.update(actuales =>
      actuales.filter((_, index) => index !== indice)
    );

    this.guardarEnStorage();
  }

  vaciar(): void {
    this.productos.set([]);
    this.guardarEnStorage();
  }

  private cargarDesdeStorage(): void {
    try {
      const guardado = localStorage.getItem(this.claveStorage);

      if (guardado === null) {
        return;
      }

      const datos: unknown = JSON.parse(guardado);

      if (
        Array.isArray(datos) &&
        datos.every(producto =>
          producto !== null &&
          typeof producto === 'object' &&
          typeof producto.id === 'number' &&
          typeof producto.price === 'number'
        )
      ) {
        this.productos.set(datos as Producto[]);
      }
    } catch (error) {
      console.error('No se pudo recuperar el carrito guardado', error);
      this.productos.set([]);
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(
        this.claveStorage,
        JSON.stringify(this.productos())
      );
    } catch (error) {
      console.error('No se pudo guardar el carrito', error);
    }
  }
}