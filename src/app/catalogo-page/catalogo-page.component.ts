import { Component, inject, signal } from '@angular/core';
import { Producto } from '../models/producto';
import { CommonModule } from '@angular/common';
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

      // Control del estado de la pantalla
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

  // Solicitudes de actualización de productos.
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

          this.categoriaSeleccionada$.next(
            this.categoriaSeleccionada()
          );
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

  
  // Actualiza el nombre del producto nuevo.
  actualizarNombreNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      title: valor
    }));
  }

  // Actualiza el precio del producto nuevo.
  actualizarPrecioNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      price: Number(valor)
    }));
  }

  // Actualiza la descripción del producto nuevo.
  actualizarDescripcionNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      description: valor
    }));
  }

  // Actualiza la categoría del producto nuevo.
  actualizarCategoriaNuevoProducto(valor: string): void {
    this.nuevoProducto.update(producto => ({
      ...producto,
      categoryId: Number(valor)
    }));
  }

  //
  // Recibe las solicitudes para crear productos nuevos.
  private solicitudesCreacion$ = new Subject<void>();

  // Procesa cada solicitud de creación y publica el resultado.
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

          // Solicita nuevamente los productos de la categoría actual.
          this.categoriaSeleccionada$.next(
            this.categoriaSeleccionada()
          );
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

  // Envía la solicitud de creación 
  crearProducto(): void {
    if (this.guardando()) {
      return;
    }

    this.solicitudesCreacion$.next();
  }


  // Manejo de eliminación de productos
  private solicitudesEliminacion$ = new Subject<Producto>();

  eliminacionResultados$ = this.solicitudesEliminacion$.pipe(
    switchMap((producto) =>
      this.productoService.eliminar(producto.id).pipe(
        tap(() => {

          this.categoriaSeleccionada$.next(
            this.categoriaSeleccionada()
          );
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
    const id = valor === '' ? null : Number(valor);

    this.categoriaSeleccionada.set(id);
    this.categoriaSeleccionada$.next(id);
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }

    //Permite consultar los productos del carrito, la cantidad y el valor total 
  carrito = this.carritoService.carrito;
  cantidadCarrito = this.carritoService.cantidad;
  totalCarrito = this.carritoService.total;

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregar(producto);
  }

  // Cambios de los campos del formulario de edición del producto
  editarProducto(producto: Producto): void {
    this.mensajeOperacion.set(null);
    this.productoEnEdicion.set({ ...producto });
  }

  cancelarEdicion(): void {
    this.productoEnEdicion.set(null);
  }

  // Guarda loscambios realizados en el producto seleccionado
  guardarEdicion(event: Event): void {
    event.preventDefault();

    const producto = this.productoEnEdicion();

    if (producto === null || this.guardando()) {
      return;
    }

    this.solicitudesActualizacion$.next(producto);
  }

  // Actualiza el dato del producto que el usuario modifica en el formulario
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

  // Abre el formulario y limpia los campos para registrar un producto nuevo.
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

  // Cierra el formulario sin crear el producto.
  cancelarCreacion(): void {
    this.mostrarFormularioCreacion.set(false);
  }

  // Confirma la eliminación del producto y envia a solicitud
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
