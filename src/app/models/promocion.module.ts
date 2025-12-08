export interface Promocion {
  id: string;
  codigo: string;           // p.ej. KING2025 (único recomendado)
  descuentoPorc: number;    // 0..100
  productosIds: string[];   // ids de Product a los que aplica
  activo: boolean;
}
