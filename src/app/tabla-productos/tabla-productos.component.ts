import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Producto } from '../models/producto';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-productos.component.html',
  styleUrl: './tabla-productos.component.css'
})

export class TablaProductosComponent {
  @Input({ required: true }) productos!: Producto[];

  @Output() editar = new EventEmitter<Producto>();
  @Output() eliminar = new EventEmitter<Producto>();

  imagenesConError = new Set<number>();

  onImageError(id: number): void {
    this.imagenesConError = new Set(this.imagenesConError).add(id);
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
   
}
