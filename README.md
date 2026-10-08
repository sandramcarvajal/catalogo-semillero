# Catálogo Semillero

Proyecto desarrollado como parte del **Semillero de Desarrollo Web de WPOSS**, utilizando Angular 17.

Este repositorio corresponde al **Módulo 01 – Componentes en Angular**, donde se implementa un catálogo de productos con diferentes vistas según el rol del usuario.

## Tecnologías

* Angular 17.3.17
* TypeScript
* HTML
* CSS
* Angular Signals
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

## Funcionalidades del Módulo 01

El proyecto implementa un catálogo de productos con:

* Vista de cliente mediante tarjetas de productos.
* Vista de administrador mediante tabla de productos.
* Cambio de rol entre administrador y cliente.
* Filtro de productos por categoría.
* Mensaje cuando no existen productos para la categoría seleccionada.
* Visualización del estado "Agotado".
* Botón para agregar productos al carrito.
* Contador de productos agregados al carrito.
* Cálculo del total del carrito.
* Acciones de editar y eliminar productos en la vista administrativa.

## Componentes principales

### `TarjetaProductoComponent`

Componente reutilizable encargado de mostrar la información de un producto.

Utiliza:

* `@Input({ required: true })` para recibir el producto.
* `@Output()` y `EventEmitter` para comunicar la acción de agregar al carrito.
* `*ngIf` para mostrar el estado "Agotado".
* `[disabled]` para deshabilitar el botón cuando el producto no tiene stock.

La tarjeta no administra el carrito ni conoce el origen de los datos. Solo recibe un producto y comunica las acciones al componente padre.

### `TablaProductosComponent`

Componente encargado de mostrar los productos en una tabla para la vista administrativa.

Utiliza:

* `@Input({ required: true })` para recibir la lista de productos.
* `@Output()` para emitir las acciones de editar y eliminar.
* `*ngFor` para recorrer los productos.
* `trackBy` utilizando el identificador del producto.
* `*ngIf` para mostrar un mensaje cuando la lista está vacía.

### `CatalogoPageComponent`

Es el componente principal del catálogo y mantiene el estado de la aplicación.

Utiliza:

* `signal()` para almacenar los productos.
* `signal()` para controlar el rol actual.
* `signal()` para almacenar la categoría seleccionada.
* `computed()` para obtener los productos filtrados.
* `computed()` para calcular la cantidad y el total del carrito.
* `*ngSwitch` para cambiar entre la vista administrativa y la vista de cliente.

## Manejo de estado

Los datos principales del catálogo se mantienen mediante Angular Signals.

Los valores derivados se calculan mediante `computed()`. Por ejemplo, los productos filtrados se obtienen a partir de la lista de productos y la categoría seleccionada, evitando mantener un estado duplicado.

## Estructura principal

```text
src/
└── app/
    ├── catalogo-page/
    ├── models/
    │   └── producto.ts
    ├── tabla-productos/
    └── tarjeta-producto/
```

Las imágenes utilizadas por los productos se encuentran en:

```text
src/assets/images/
```

## Verificación del proyecto

Para comprobar que el proyecto compila correctamente:

```bash
ng build
```

La compilación debe finalizar sin errores.

## Rama del módulo

El desarrollo del Módulo 0
