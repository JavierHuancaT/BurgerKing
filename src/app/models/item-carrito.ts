export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
  opciones?: Record<string, string>;
}

export interface TotalesCarrito {
  subtotal: number;
  descuento: number;
  total: number;
}