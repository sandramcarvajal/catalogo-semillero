import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../models/producto';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.css'
})
export class AdminProductosComponent {
  private productoService = inject(ProductoService);

  cargando = signal(true);
  productos = signal<Producto[]>([]);

  errorCarga = this.productoService.errorCarga;

  constructor() {
    this.productoService.obtenerTodos().subscribe((productos) => {
      this.productos.set(productos);
      this.cargando.set(false);
    });
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
}
