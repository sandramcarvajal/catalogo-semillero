import { Component, computed, signal } from '@angular/core';
import { Producto } from '../models/producto';
import { CommonModule } from '@angular/common';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { TablaProductosComponent } from '../tabla-productos/tabla-productos.component';

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
  productos = signal<Producto[]>([
    {
      id: 1,
      title: 'Laptop HP Pavilion 15',
      price: 2499900,
      description: 'Laptop con procesador Intel Core i5, 8GB de RAM y 256GB de almacenamiento',
      images: ['assets/images/laptop1.png'],
      stock: 0,
      category: {
        id: 1,
        name: 'Computadoras'
      }
    },
    {
      id: 2,
      title: 'Audifonos',
      price: 85000,
      description: 'Audifonos inalambricos con cancelacion de ruido',
      images: ['assets/images/audifonos1.png'],
      stock: 15,
      category: {
        id: 2,
        name: 'Accesorios'
      }
    },
    {
      id: 3,
      title: 'Smartphone Samsung Galaxy S21',
      price: 1999900,
      description: 'Smartphone con pantalla AMOLED de 6.2 pulgadas, cámara triple y batería de 4000 mAh',
      images: ['assets/images/smartphone1.png'],
      stock: 5,
      category: {
        id: 3,
        name: 'Celulares'
      }
    },
    {
      id: 4,
      title: 'Tablet Apple iPad Air',
      price: 2999900,
      description: 'Tablet con pantalla Retina de 10.9 pulgadas, chip A14 Bionic y compatibilidad con Apple Pencil',
      images: ['assets/images/tablet1.png'],
      stock: 8,
      category: {
        id: 4,
        name: 'Tablets'
      }
    },
    {
      id: 5,
      title: 'Smartwatch Garmin Forerunner 245',
      price: 1299900,
      description: 'Smartwatch con GPS, monitor de frecuencia cardíaca y seguimiento de actividad física',  
    images: ['assets/images/smartwatch1.png'],
      stock: 12,
      category: {
        id: 5,
        name: 'Relojes inteligentes'
      }
    },
    {
      id: 6,
      title: 'Cámara Canon EOS Rebel T7',
      price: 1499900,
      description: 'Cámara réflex digital con sensor de 24.1 megapíxeles, grabación de video Full HD y conectividad Wi-Fi',
      images: ['assets/images/camara1.png'],
      stock: 6,
      category: {
        id: 6,
        name: 'Cámaras'
      }
    }
  ]);

     rol = signal<'admin' | 'customer'>('customer');
  cambiarRol() {
    this.rol.set(this.rol() === 'admin' ? 'customer' : 'admin');
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }

  categoriaSeleccionada = signal<string>('Todas');

  productosFiltrados = computed(() => {
    if (this.categoriaSeleccionada() === 'Todas') {
      return this.productos();
    } else {
      return this.productos().filter(producto => producto.category.name === 
        this.categoriaSeleccionada());
    }
  });

  carrito = signal<Producto[]>([]);
  cantidadCarrito = computed(() => this.carrito().length);
  totalCarrito = computed(() => this.carrito().reduce((total, producto) => 
    total + producto.price, 0));

  agregarAlCarrito(producto: Producto) {
    const carritoActual = this.carrito();
    
      this.carrito.set([...carritoActual, producto]);
    }

    categorias = [
      'Computadoras',
      'Accesorios',
      'Celulares',
      'Tablets',
      'Relojes inteligentes',
      'Cámeras'
    ];

  editarProducto(producto: Producto) {
    console.log('Editar producto:', producto);
  }

  eliminarProducto(producto: Producto) {
    this.productos.update(productos => 
      productos.filter(p => p.id !== producto.id)
    );
  }
}
