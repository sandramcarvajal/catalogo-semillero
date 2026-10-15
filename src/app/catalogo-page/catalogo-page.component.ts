import { Component, inject, signal } from '@angular/core';
import { Producto } from '../models/producto';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { TablaProductosComponent } from '../tabla-productos/tabla-productos.component';
import { ProductoService } from '../services/producto.service';
import { CategoriaService } from '../services/categoria.service';
import { CarritoService } from '../services/carrito.service';
import { 
  BehaviorSubject,
  Subject,
  catchError, 
  finalize, 
  map,
  of, 
  shareReplay, 
  switchMap,
  tap
} from 'rxjs';

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
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);

    rol = signal<'admin' | 'customer'>('customer');
    cargando = signal(true);
    errorConsulta = signal<string | null>(null);
    errorCategorias = signal<string | null>(null);
    mensajeOperacion = signal<{ exito: boolean; mensaje: string } | null>(null);
    guardando = signal(false);
    productoEnEdicion = signal<Producto | null>(null);
    mostrarFormularioCreacion = signal(false);
    nuevoProducto = signal({
      title: '',
      price: 0,
      description: '',
      categoryId: 1
    });
  

    categorias$ = this.categoriaService.obtenerTodas().pipe (
      catchError((error) => {
        console.error('Errror al cargar categorias', error);
        this.errorCategorias.set('No fue posible cargar la categorias');
        return of([]);
      }),
      shareReplay(1)
    );

    // Filtros de la URL: ?categoria= y ?pagina=
    categoriaSeleccionada = signal<number | null>(null);
    paginaActual = signal(1);
    totalProductos = signal(0);
    readonly tamanoPagina = 6;

    private filtros$ = new BehaviorSubject<{
      categoria: number | null;
      pagina: number;
    }>({ categoria: null, pagina: 1 });

    
    productos$ = this.filtros$.pipe (
      switchMap(({ categoria, pagina }) => {
        this.cargando.set(true);
        this.errorConsulta.set(null);

        const peticion$ = categoria === null
          ? this.productoService.obtenerTodos()
          : this.productoService.obtenerPorCategoria(categoria);

        return peticion$.pipe (
          tap((productos) => this.totalProductos.set(productos.length)),
          map((productos) => {
            const inicio = (pagina - 1) * this.tamanoPagina;
            return productos.slice(inicio, inicio + this.tamanoPagina);
          }),
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

  constructor() {
    // Los filtros viven en la URL: se comparten y sobreviven al F5.
    this.ruta.queryParamMap.subscribe((params) => {
      const categoriaParam = params.get('categoria');
      const categoria =
        categoriaParam === null || categoriaParam === ''
          ? null
          : Number(categoriaParam);
      const pagina = Number(params.get('pagina')) || 1;

      this.categoriaSeleccionada.set(categoria);
      this.paginaActual.set(pagina);
      this.filtros$.next({ categoria, pagina });
    });
  }

  // Vuelve a pedir los productos con los filtros actuales.
  private recargar(): void {
    this.filtros$.next({
      categoria: this.categoriaSeleccionada(),
      pagina: this.paginaActual()
    });
  }

  private solicitudesActualizacion$ = new Subject<Producto>();

  actualizacionResultado$ = this.solicitudesActualizacion$.pipe(
    switchMap((producto) => {
      this.guardando.set(true);
      this.mensajeOperacion.set(null);

      const cambios = {
        title: producto.title,
        price: producto.price,
        description: producto.description,
        categoryId: producto.category.id,
        images: producto.images
      };

      return this.productoService.actualizar(producto.id, cambios).pipe(
        tap(() => {
          this.productoEnEdicion.set(null);

          this.recargar();
        }),
        map((actualizado) => ({
          exito: true,
          mensaje: `Producto "${actualizado.title}" actualizado correctamente.`
        })),
        catchError((error) => {
          console.error('Error al actualizar el producto:', error);

          return of({
            exito: false,
            mensaje: 'No fue posible actualizar el producto. Intenta nuevamente.'
          });
        }),
        tap((resultado) => this.mensajeOperacion.set(resultado)),
        finalize(() => this.guardando.set(false))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  
  actualizarNombreNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      title: valor
    }));
  }

  actualizarPrecioNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      price: Number(valor)
    }));
  }

  actualizarDescripcionNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      description: valor
    }));
  }

  actualizarCategoriaNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      categoryId: Number(valor)
    }));
  }

  private solicitudesCreacion$ = new Subject<void>();

  creacionResultado$ = this.solicitudesCreacion$.pipe(
    switchMap(() => {
      const datos = this.nuevoProducto();

      // Evita enviar campos obligatorios vacíos o valores inválidos.
      if (
        !datos.title.trim() ||
        !datos.description.trim() ||
        datos.price < 0
      ) {
        const resultado = {
          exito: false,
          mensaje: 'Completa los campos y verifica que el precio sea válido.'
        };

        this.mensajeOperacion.set(resultado);
        return of(resultado);
      }

      this.guardando.set(true);
      this.mensajeOperacion.set(null);

      
      return this.productoService.crear({
        title: datos.title.trim(),
        price: datos.price,
        description: datos.description.trim(),
        categoryId: datos.categoryId,
        images: ['https://placehold.co/600x400']
      }).pipe(
        tap((creado) => {
          this.mostrarFormularioCreacion.set(false);
          this.nuevoProducto.set({
            title: '',
            price: 0,
            description: '',
            categoryId: 1
          });

          this.recargar();
        }),
        map((creado) => ({
          exito: true,
          mensaje: `Producto "${creado.title}" creado correctamente.`
        })),
        catchError((error) => {
          console.error('Error al crear el producto:', error);
          return of({
            exito: false,
            mensaje: 'No fue posible crear el producto. Intenta nuevamente.'
          });
        }),
        tap((resultado) => this.mensajeOperacion.set(resultado)),
        finalize(() => this.guardando.set(false))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  crearProducto(): void {
    if (this.guardando()) {
      return;
    }

    this.solicitudesCreacion$.next();
  }


  private solicitudesEliminacion$ = new Subject<Producto>();

  eliminacionResultados$ = this.solicitudesEliminacion$.pipe(
    switchMap((producto) =>
      this.productoService.eliminar(producto.id).pipe(
        tap(() => {

          this.recargar();
        }),
        map(() => ({
          exito: true,
          mensaje: `Producto "${producto.title}" eliminado correctameente.`
        })),
        catchError((error) => {
          console.error('Error al eliminar el producto', error);

          return of({
            exito: false,
            mensaje: 'No fue posible eliminar el producto. Intenta nuevamente.'
          });
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true})
  );
      
  // El servicio conserva el mensaje de error de obtenerTodos()
  errorCarga = this.productoService.errorCarga;

  cambiarRol(): void {
    this.rol.set(
      this.rol() === 'admin' ? 'customer' : 'admin'
    );
  }

  cambiarCategoria(valor: string): void {
    const categoria = valor === '' ? null : Number(valor);

    this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { categoria, pagina: 1 }
    });
  }

  cambiarPagina(pagina: number): void {
    this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: {
        categoria: this.categoriaSeleccionada(),
        pagina
      }
    });
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }

  carrito = this.carritoService.carrito;
  cantidadCarrito = this.carritoService.cantidad;
  totalCarrito = this.carritoService.total;

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregar(producto);
  }

  editarProducto(producto: Producto): void {
    this.mensajeOperacion.set(null);
    this.productoEnEdicion.set({ ...producto });
  }

  cancelarEdicion(): void {
    this.productoEnEdicion.set(null);
  }

  guardarEdicion(event: Event): void {
    event.preventDefault();

    const producto = this.productoEnEdicion();

    if (producto === null || this.guardando()) {
      return;
    }

    this.solicitudesActualizacion$.next(producto);
  }

  actualizarCampoEdicion(
    campo: 'title' | 'price' | 'description',
    valor: string
  ): void {
    this.productoEnEdicion.update((producto) => {
      if (producto === null) {
        return null;
      }

      if (campo === 'price') {
        return { ...producto, [campo]: Number(valor) };
      }

      return { ...producto, [campo]: valor };
    });
  }

  abrirFormularioCreacion(): void {
    this.mensajeOperacion.set(null);

    this.nuevoProducto.set({
      title: '',
      price: 0,
      description: '',
      categoryId: 1
    });

    this.mostrarFormularioCreacion.set(true);
  }

  cancelarCreacion(): void {
    this.mostrarFormularioCreacion.set(false);
  }

  eliminarProducto(producto: Producto): void {
    const confirmar = window.confirm(
      `¿Estas seguro de que deseas eliminar este producto: " ${producto.title}"?`
    );

    if (!confirmar) {
      return;
    }

    this.mensajeOperacion.set(null);
    this.solicitudesEliminacion$.next(producto);
  }


}
