import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Producto } from '../models/producto';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-producto.component.html',
  styleUrl: './detalle-producto.component.css'
})
export class DetalleProductoComponent {
  private ruta = inject(ActivatedRoute);
  private productoService = inject(ProductoService);

  // paramMap en vez del snapshot: al pasar de un id a otro se vuelve a pedir.
  estado$ = this.ruta.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));

      return this.productoService.obtenerPorId(id).pipe(
        switchMap((producto) =>
          this.productoService.obtenerPorCategoria(producto.category.id).pipe(
            map((productos) => ({
              cargando: false,
              producto,
              relacionados: productos
                .filter((p) => p.id !== producto.id)
                .slice(0, 4),
              error: null as string | null
            }))
          )
        ),
        catchError(() =>
          of({
            cargando: false,
            producto: null,
            relacionados: [] as Producto[],
            error: 'No encontramos ese producto. Puede que ya no exista.'
          })
        ),
        startWith({
          cargando: true,
          producto: null as Producto | null,
          relacionados: [] as Producto[],
          error: null
        })
      );
    })
  );
}
