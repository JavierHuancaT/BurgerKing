import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'; // <--- AGREGAR ViewChild
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { AuthService } from 'src/app/auth/auth.service';
import { PedidosService } from 'src/app/services/pedidos.service';
// <--- AGREGAR import del componente hijo
import { RetiroComidaComponent } from '../retiro-comida/retiro-comida.component';

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

  // <--- AGREGAR Referencia al componente hijo
  @ViewChild(RetiroComidaComponent) retiroComponent!: RetiroComidaComponent;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private pedidosService: PedidosService,
  ) {}

  ngOnInit(): void {
    // Tu lógica original intacta
    this.subs.push(
      this.carritoService.productos$.subscribe(p => {
        this.productos = p;
      })
    );

    this.subs.push(
      this.carritoService.visible$.subscribe(v => {
        this.visible = v;
      })
    );

    this.subs.push(
      this.carritoService.contador$.subscribe(c => this.contador = c)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    document.body.style.overflow = '';
  }

  cerrar(): void {
    this.carritoService.cerrarCarrito();
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
  }

  // Vaciar carrito
  vaciar(): void {
    this.carritoService.vaciarCarrito();
    this.resetearEnvio(); // <--- AGREGAR llamada al reset aquí también
  }

  cambiarCantidad(index: number, delta: number): void {
    const producto = this.productos[index];
    if (!producto) return;
    
    const nuevaCantidad = (producto.cantidad || 1) + delta;
    
    if (nuevaCantidad < 1) return;
    
    this.carritoService.actualizarCantidad(index, nuevaCantidad);
  }

  calcularSubtotalProducto(producto: any): number {
    return (producto.precio || 0) * (producto.cantidad || 1);
  }

  // Finalizar compra
  finalizarCompra(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { 
      alert('Debes iniciar sesión para finalizar tu compra.'); 
      return; 
    }

    if (!this.opcionRetiro) {
      alert('Por favor, selecciona una opción de retiro.');
      return;
    }

    const items = this.productos.map(p => ({
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      imagen: p.imagen,
      personalizaciones: p.personalizaciones
    }));

    try {
      this.pedidosService.crearPedido(items, this.opcionRetiro);
      alert('¡Pedido realizado con éxito! Gracias por tu compra.');
      
      this.carritoService.vaciarCarrito();
      this.carritoService.cerrarCarrito();
      
      // <--- AGREGAR Reinicio de la selección de envío
      this.resetearEnvio(); 

    } catch (e) {
      console.error(e);
      alert('No se pudo procesar tu pedido. Intenta nuevamente.');
    }
  }

  onOpcionRetiroSeleccionada(opcion: string) {
    this.opcionRetiro = opcion;
  }

  calcularTotal(): number {
    const subtotal = this.productos.reduce((s, p) => s + (p.precio || 0) * (p.cantidad || 1), 0);
    return this.opcionRetiro === 'Delivery' ? subtotal + 2500 : subtotal;
  }

  // <--- NUEVO MÉTODO PRIVADO
  private resetearEnvio() {
    this.opcionRetiro = undefined; // Resetea variable local
    if (this.retiroComponent) {
      this.retiroComponent.reset(); // Resetea visualmente al hijo
    }
  }
}