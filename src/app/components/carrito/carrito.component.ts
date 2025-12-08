import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { AuthService } from 'src/app/auth/auth.service';

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
    private auth: AuthService
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

  // Finalizar compra → crea un pedido en localStorage con su propia KEY
  finalizarCompra(): void {
    // Toma el usuario actual (si hay sesión) y lo mapea a la metadata del pedido
    const u = this.auth.getCurrentUser();
    const usuarioMeta = u ? { id: u.id, nombre: u.name, email: u.email } : undefined;

    const result = this.carritoService.confirmarPedido(
      this.opcionRetiro,     // retiro en tienda / delivery (según tu componente hijo)
      usuarioMeta            // opcional: si no hay login, va undefined
    );

    if (!result) {
      alert('Tu carrito está vacío.');
      return;
    }

    // Feedback + limpieza de carrito
    alert(`Pedido enviado ✅\nCódigo: ${result.id}`);
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
