import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Producto } from '../models/producto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/products`;
  private _errorCarga = signal<string | null>(null);

  // Método para consultar todos los productos
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

  // Método para consultar un producto por ID
  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`);
  }

  // Método para crear un producto nuevo
  crear(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // Método para actualizar un producto
  actualizar(
    id: number,
    cambios: Partial<Producto>): Observable<Producto> {
      return this.http.put<Producto>(
      `${this.apiUrl}/${id}`,
      cambios
    );
  }
  
  // Método para eliminar un producto
  eliminar(id: number): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }

  // Consultar por cateegoria ID
  obtenerPorCategoria(id: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(
      `${this.apiUrl}/?categoryId=${id}`
    );
  }

  // Manejo de error
  errorCarga = this._errorCarga.asReadonly();
 
}
