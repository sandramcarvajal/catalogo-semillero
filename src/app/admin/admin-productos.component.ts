import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PuedeSalir } from '../guards/cambios-sin-guardar.guard';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.css'
})
export class AdminProductosComponent implements PuedeSalir {
  private productoService = inject(ProductoService);

  titulo = signal('');
  precio = signal(0);
  descripcion = signal('');

  guardando = signal(false);
  mensaje = signal<{ exito: boolean; mensaje: string } | null>(null);

  // Bandera que consulta el CanDeactivate antes de dejar la ruta.
  private modificado = false;

  cambiarTitulo(valor: string): void {
    this.titulo.set(valor);
    this.modificado = true;
  }

  cambiarPrecio(valor: string): void {
    this.precio.set(Number(valor));
    this.modificado = true;
  }

  cambiarDescripcion(valor: string): void {
    this.descripcion.set(valor);
    this.modificado = true;
  }

  puedeSalir(): boolean {
    return !this.modificado;
  }

  crear(): void {
    if (!this.titulo().trim() || !this.descripcion().trim()) {
      this.mensaje.set({
        exito: false,
        mensaje: 'Completá el título y la descripción.'
      });
      return;
    }

    this.guardando.set(true);

    this.productoService
      .crear({
        title: this.titulo().trim(),
        price: this.precio(),
        description: this.descripcion().trim(),
        categoryId: 1,
        images: ['https://placehold.co/600x400']
      })
      .subscribe({
        next: (producto) => {
          this.guardando.set(false);
          this.modificado = false;
          this.mensaje.set({
            exito: true,
            mensaje: `Producto "${producto.title}" creado correctamente.`
          });
          this.titulo.set('');
          this.precio.set(0);
          this.descripcion.set('');
        },
        error: () => {
          this.guardando.set(false);
          this.mensaje.set({
            exito: false,
            mensaje: 'No fue posible crear el producto. Intenta nuevamente.'
          });
        }
      });
  }
}
