export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  stock?: number;
  category: {
    id: number;
    name: string;
  };
}


export interface CrearProducto {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
}
