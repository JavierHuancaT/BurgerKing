import { Component, OnInit } from '@angular/core';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  // Lista de productos añadidos al carrito
  productos: any[] = [];

  // Total general del carrito
  total: number = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    // Cargar los productos actuales del carrito desde el servicio
    this.productos = this.carritoService.obtenerProductos();
    this.calcularTotal();
  }

  // Calcula el total general del carrito
  calcularTotal(): void {
    this.total = this.productos.reduce((sum, prod) => sum + prod.precio * prod.cantidad, 0);
  }

  // Permite eliminar un producto específico
  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
    this.productos = this.carritoService.obtenerProductos();
    this.calcularTotal();
  }

  // Permite vaciar el carrito completo
  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    this.productos = [];
    this.total = 0;
  }

  // Simula el proceso de pago
  procederPago(): void {
    alert('¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.');
    this.vaciarCarrito();
  }
}