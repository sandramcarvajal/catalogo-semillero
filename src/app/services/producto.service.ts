import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Producto, CrearProducto, ActualizarProducto } from '../models/producto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/products`;
  private _errorCarga = signal<string | null>(null);

  obtenerTodos(): Observable<Producto[]> {
    this._errorCarga.set(null);

    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al cargar productos', error);

        this._errorCarga.set(
          'No fue posible cargar los productos. Intenta nuevamente.'
        );
        return of([]);
      })
    );
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`);
  }

  crear(producto: CrearProducto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }


  actualizar(
    id: number,
    cambios: ActualizarProducto): Observable<Producto> {
      return this.http.put<Producto>(
      `${this.apiUrl}/${id}`,
      cambios
    );
  }
  
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerPorCategoria(id: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(
      `${this.apiUrl}/?categoryId=${id}`
    );
  }

  errorCarga = this._errorCarga.asReadonly();
 
}
