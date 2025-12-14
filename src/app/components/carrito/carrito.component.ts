import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { AuthService } from 'src/app/auth/auth.service';
import { PedidosService } from 'src/app/services/pedidos.service';

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
  opcionRetiro: string | undefined;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private pedidosService: PedidosService,
  ) {}

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

  // Cambiar cantidad de un producto
  cambiarCantidad(index: number, delta: number): void {
    const producto = this.productos[index];
    if (!producto) return;
    
    const nuevaCantidad = (producto.cantidad || 1) + delta;
    this.carritoService.actualizarCantidad(index, nuevaCantidad);
  }

  // Calcular subtotal por producto
  calcularSubtotalProducto(producto: any): number {
    return (producto.precio || 0) * (producto.cantidad || 1);
  }

  // Finalizar compra → crea un pedido en localStorage con su propia KEY
  finalizarCompra(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { alert('Debes iniciar sesión.'); return; }

    const items = this.productos.map(p => ({
      nombre: p.nombre,
      precio: p.precio,        // 👈 ya viene con promo si el catálogo lo pasó así
      cantidad: p.cantidad,
      imagen: p.imagen
    }));

    try {
      this.pedidosService.crearPedido(items, this.opcionRetiro);
      alert('Pedido enviado. ¡Gracias por comprar en Burger King!');
    } catch (e) {
      console.error(e);
      alert('No se pudo crear el pedido.');
    }

    this.carritoService.vaciarCarrito();
    this.carritoService.cerrarCarrito();
  }

  // Recibir la opción desde RetiroComidaComponent
  onOpcionRetiroSeleccionada(opcion: string) {
    this.opcionRetiro = opcion;
  }

  // Calcular total (se llama desde el template)
  calcularTotal(): number {
    return this.productos.reduce((s, p) => s + (p.precio || 0) * (p.cantidad || 1), 0);
  }
}
