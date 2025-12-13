import { OpcionPersonalizacion } from "./opcion-personalizacion.model";

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  descripcion?:string;
  categoria?: string;
  imageData?: string;   // ← Data URL (base64) opcional
  personalizaciones?: OpcionPersonalizacion[];
}
