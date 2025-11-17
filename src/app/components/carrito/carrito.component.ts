import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {

  productos: any[] = [];
  visible = false;
  contador = 0;

  private subs: Subscription[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    // Subscribir a productos
    this.subs.push(
      this.carritoService.productos$.subscribe(p => {
        this.productos = p;
      })
    );

    // Subscribir a visibilidad
    this.subs.push(
      this.carritoService.visible$.subscribe(v => {
        this.visible = v;
        if (v) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
      })
    );

    // Subscribir a contador (opcional, para internal)
    this.subs.push(
      this.carritoService.contador$.subscribe(c => this.contador = c)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    document.body.style.overflow = '';
  }

  // Abrir/cerrar desde el propio componente (X)
  cerrar(): void {
    this.carritoService.cerrarCarrito();
  }

  // Eliminar producto
  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
  }

  // Vaciar carrito
  vaciar(): void {
    this.carritoService.vaciarCarrito();
  }

  // Finalizar compra (simulación)
  finalizarCompra(): void {
    alert('Pedido enviado. Gracias por comprar en Burger King!');
    this.carritoService.vaciarCarrito();
    this.carritoService.cerrarCarrito();
  }

  // Calcular total (se llama desde template)
  calcularTotal(): number {
    return this.productos.reduce((s, p) => s + (p.precio || 0) * (p.cantidad || 1), 0);
  }
}