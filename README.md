# Catálogo Semillero

Proyecto desarrollado como parte del **Semillero de Desarrollo Web de WPOSS**, utilizando Angular 17.

Este repositorio corresponde al **Módulo 02 — Servicios, inyección de dependencias y HttpClient**. El catálogo ya no trabaja con datos locales: consume la **Platzi Fake Store API (EscuelaJS)** a través de servicios, con inyección de dependencias, observables y el pipe `async`.

## Tecnologías

* Angular 17.3.17
* TypeScript
* RxJS (Observables, `pipe async`)
* Angular Signals
* HTML y CSS
* Platzi Fake Store API (EscuelaJS) — `https://api.escuelajs.co/api/v1`
* Git y GitHub

## Requisitos

Antes de ejecutar el proyecto se requiere tener instalado:

* Node.js 20 LTS o superior
* npm
* Angular CLI 17

Para verificar las versiones:

```bash
node --version
npm --version
ng version
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/sandramcarvajal/catalogo-semillero.git
```

Ingresar al proyecto:

```bash
cd catalogo-semillero
```

Instalar las dependencias:

```bash
npm install
```

## Servidor de desarrollo

Ejecutar:

```bash
ng serve
```

Luego abrir en el navegador:

```text
http://localhost:4200/
```

La aplicación se recarga automáticamente cuando se realizan cambios en los archivos del proyecto.

## Configuración de la API

La URL base se define en `src/environments/environment.ts` (y en `environment.development.ts`), no está quemada en los servicios:

```ts
export const environment = {
  apiUrl: 'https://api.escuelajs.co/api/v1'
};
```

`HttpClient` se registra en `src/app/app.config.ts` mediante `provideHttpClient()`.

### Endpoints utilizados

| Método | Endpoint | Uso |
| ------ | -------- | --- |
| GET | `/products` | Lista todos los productos |
| GET | `/products/{id}` | Un producto por id |
| GET | `/products/?categoryId={id}` | Filtra por categoría |
| GET | `/categories` | Lista de categorías |
| POST | `/products` | Crea un producto |
| PUT | `/products/{id}` | Actualiza un producto |
| DELETE | `/products/{id}` | Elimina un producto |

## Funcionalidades

* Catálogo de productos obtenido desde la API.
* Dos vistas según el rol: cliente (tarjetas) y administrador (tabla).
* Filtro por categoría que consulta el endpoint con `categoryId` (no filtra en memoria).
* Creación, edición y eliminación de productos en la vista administrativa.
* Carrito: agregar, quitar y vaciar; cantidad y total derivados.
* Persistencia del carrito en LocalStorage.
* Estado de carga mientras la petición está en curso.
* Estado vacío cuando la respuesta no trae resultados.
* Manejo de errores visible al usuario, no solo en consola.

## Servicios

### `ProductoService`

Servicio (`providedIn: 'root'`) que concentra las llamadas a `/products` con `HttpClient` inyectado vía `inject()`.

* `obtenerTodos()`, `obtenerPorId(id)`, `obtenerPorCategoria(id)`, `crear(producto)`, `actualizar(id, cambios)`, `eliminar(id)`.
* Todos devuelven `Observable<T>` con genérico explícito.
* `obtenerTodos()` maneja el error con `catchError` devolviendo `of([])` y publica un mensaje de error en un signal de solo lectura.

### `CategoriaService`

Servicio (`providedIn: 'root'`) que consulta `/categories`.

* `obtenerTodas(): Observable<Categoria[]>`.

### `CarritoService`

Servicio (`providedIn: 'root'`) que mantiene el estado del carrito con signals.

* `carrito` expuesto con `asReadonly()`.
* `cantidad` y `total` derivados con `computed()`.
* `agregar()`, `quitar()` y `vaciar()`.
* Persiste en LocalStorage tras cada cambio y restaura al construirse dentro de `try/catch`.

## Componentes

### `TarjetaProductoComponent`

Muestra la información de un producto.

* `@Input({ required: true })` para recibir el producto.
* `@Output()` y `EventEmitter` para comunicar la acción de agregar al carrito.
* No administra el carrito ni conoce el origen de los datos.

### `TablaProductosComponent`

Muestra los productos en una tabla para la vista administrativa.

* `@Input({ required: true })` para recibir la lista de productos.
* `@Output()` para emitir las acciones de editar y eliminar.
* `*ngFor` con `trackBy` y estado vacío con `*ngIf`.

### `CatalogoPageComponent`

Componente contenedor del catálogo.

* Inyecta `ProductoService`, `CategoriaService` y `CarritoService`.
* Expone observables (`productos$`, `categorias$`) consumidos con el pipe `async`.
* `*ngSwitch` para cambiar entre la vista administrativa y la de cliente.
* Concentra el estado de la pantalla (rol, carga, edición, mensajes) con signals.

## Verificación del proyecto

Para comprobar que el proyecto compila correctamente:

```bash
ng build
```

La compilación debe finalizar sin errores ni advertencias.

## Rama del módulo

El desarrollo del Módulo 02 está en la rama `modulo-02-servicios`.
