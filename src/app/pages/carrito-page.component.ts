import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito-page.component.html',
  styleUrl: './carrito-page.component.css'
})
export class CarritoPageComponent {
  private carritoService = inject(CarritoService);

  carrito = this.carritoService.carrito;
  cantidad = this.carritoService.cantidad;
  total = this.carritoService.total;

  quitar(id: number): void {
    this.carritoService.quitar(id);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }
}
