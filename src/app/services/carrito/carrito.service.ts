import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private productos: any[] = [];

  // Agrega un producto al carrito
  agregarProducto(producto: any): void {
    const existente = this.productos.find(p => p.nombre === producto.nombre);
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      this.productos.push(producto);
    }
  }

  // Devuelve todos los productos del carrito
  obtenerProductos(): any[] {
    return this.productos;
  }

  // Elimina un producto por índice
  eliminarProducto(index: number): void {
    this.productos.splice(index, 1);
  }

  // Vacía el carrito completo
  vaciarCarrito(): void {
    this.productos = [];
  }
}