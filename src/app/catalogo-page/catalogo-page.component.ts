import { Component, computed, inject, signal } from '@angular/core';
import { Producto } from '../models/producto';
import { CommonModule } from '@angular/common';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { TablaProductosComponent } from '../tabla-productos/tabla-productos.component';
import { ProductoService } from '../services/producto.service';
import { CategoriaService } from '../services/categoria.service';
import { BehaviorSubject, catchError, finalize, of, shareReplay, switchMap } from 'rxjs';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    CommonModule, 
    TarjetaProductoComponent, 
    TablaProductosComponent
  ],
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.css'
})
export class CatalogoPageComponent {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private carritoService = inject(CarritoService);

      // Estado de la pantalla
    rol = signal<'admin' | 'customer'>('customer');
    cargando = signal(true);
    errorConsulta = signal<string | null>(null);
    errorCategorias = signal<string | null>(null);

  // Categorias consultadas desde la API
    categorias$ = this.categoriaService.obtenerTodas().pipe (
      catchError((error) => {
        console.error('Errror al cargar categorias', error);
        this.errorCategorias.set('No fue posible cargar la categorias');
        return of([]);
      }),
      shareReplay(1)
    );

    // Muestra todas las categorias
    categoriaSeleccionada = signal<number | null>(null);
    private categoriaSeleccionada$ =
      new BehaviorSubject<number | null>(null);

    
    // Productos consultados desde la API
    productos$ = this.categoriaSeleccionada$.pipe (
      switchMap((categoriaId) => {
        this.cargando.set(true);
        this.errorConsulta.set(null);

        const peticion$ = categoriaId === null
          ? this.productoService.obtenerTodos()
          : this.productoService.obtenerPorCategoria(categoriaId);

        return peticion$.pipe (
          catchError((error) => {
            console.error('Error al consultar productos', error);
            this.errorConsulta.set(
              'No fue posible consultar los productos. Intenta nuevamente.'
            );
            return of([]);
        }),
        finalize(() => this.cargando.set(false))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
      
  // El servicio conserva el mensaje de error de obtenerTodos()
  errorCarga = this.productoService.errorCarga;

  cambiarRol(): void {
    this.rol.set(
      this.rol() === 'admin' ? 'customer' : 'admin'
    );
  }

  cambiarCategoria(valor: string): void {
    const id = valor === '' ? null : Number(valor);

    this.categoriaSeleccionada.set(id);
    this.categoriaSeleccionada$.next(id);
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }

    //Carrito
  carrito = this.carritoService.carrito;
  cantidadCarrito = this.carritoService.cantidad;
  totalCarrito = this.carritoService.total;

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregar(producto);
  }

  editarProducto(producto: Producto): void {
    console.log('Editar producto:', producto);
  }

  eliminarProducto(producto: Producto): void {
    console.log('Eliminar producto:', producto);
  }
}
