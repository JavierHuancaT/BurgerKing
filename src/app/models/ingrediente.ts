export interface Ingrediente {
  id: string;
  nombre: string;        // Queso, Lechuga, etc.
  cantidad: number;      // cantidad disponible
  unidad?: string;       // opcional: g, und, ml
}
    