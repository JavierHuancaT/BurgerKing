import { OpcionPersonalizacion } from "./opcion-personalizacion.model";

export interface ItemCarrito {
  id: string;
  // Es necesaria para que el Service y el Componente sepan qué fila actualizar
  cartItemId?: string; 
  productId?: string; // ID del producto original para editar
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  personalizaciones?: OpcionPersonalizacion[];
  opciones?: Record<string, string>;
}

export interface TotalesCarrito {
  subtotal: number;
  descuento: number;
  total: number;
}