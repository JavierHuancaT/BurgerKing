import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Productos (BehaviorSubject para que componentes puedan suscribirse)
  private productosSubject = new BehaviorSubject<any[]>(this.cargarDesdeLocal());
  productos$ = this.productosSubject.asObservable();

  // Visible (panel desplegable)
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  // Contador total (sólo emite el total de cantidades)
  private contadorSubject = new BehaviorSubject<number>(this.calcularContador(this.productosSubject.value));
  contador$ = this.contadorSubject.asObservable();

  constructor() {}

  // Agrega un producto (si existe, suma cantidad). Producto: { nombre, precio, cantidad, imagen?, ... }
  agregarProducto(producto: any): void {
    const actuales = [...this.productosSubject.value];
    const idx = actuales.findIndex(p => p.nombre === producto.nombre && JSON.stringify(p.personalizaciones||{}) === JSON.stringify(producto.personalizaciones||{}));
    if (idx !== -1) {
      actuales[idx].cantidad = (actuales[idx].cantidad || 0) + (producto.cantidad || 1);
    } else {
      actuales.push({ ...producto, cantidad: producto.cantidad || 1 });
    }
    this.productosSubject.next(actuales);
    this.guardarEnLocal(actuales);
    this.actualizarContador(actuales);
  }

  // Reemplazar lista completa (útil para tests)
  setProductos(productos: any[]): void {
    this.productosSubject.next(productos);
    this.guardarEnLocal(productos);
    this.actualizarContador(productos);
  }

  // Eliminar por índice
  eliminarProducto(index: number): void {
    const actuales = [...this.productosSubject.value];
    if (index >= 0 && index < actuales.length) {
      actuales.splice(index, 1);
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    }
  }

  // Vaciar carrito
  vaciarCarrito(): void {
    this.productosSubject.next([]);
    localStorage.removeItem('carrito');
    this.actualizarContador([]);
  }

  // Obtener productos (sincrónico)
  obtenerProductosSnapshot(): any[] {
    return this.productosSubject.value;
  }

  // Mostrar/ocultar panel
  toggleVisible(): void {
    this.visibleSubject.next(!this.visibleSubject.value);
  }
  abrirCarrito(): void {
    this.visibleSubject.next(true);
  }
  cerrarCarrito(): void {
    this.visibleSubject.next(false);
  }

  // --- Helpers ---
  private guardarEnLocal(productos: any[]): void {
    try {
      localStorage.setItem('carrito', JSON.stringify(productos));
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage', e);
    }
  }

  private cargarDesdeLocal(): any[] {
    try {
      const raw = localStorage.getItem('carrito');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  private actualizarContador(productos: any[]): void {
    const total = this.calcularContador(productos);
    this.contadorSubject.next(total);
  }

  private calcularContador(productos: any[]): number {
    return productos.reduce((s, p) => s + (p.cantidad || 0), 0);
  }
}