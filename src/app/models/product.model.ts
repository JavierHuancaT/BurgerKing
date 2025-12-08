export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  descripcion?:string;
  imageData?: string;   // ← Data URL (base64) opcional
}
