import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ===== Tipos para pedidos =====
export interface ItemPedido {
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  personalizaciones?: any;
}

export interface UsuarioPedidoMeta {
  id?: string;        // si tienes id del usuario logueado
  nombre?: string;    // o username/email
  email?: string;
}

export interface Pedido {
  id: string;                 // p.ej. PED-2025-12-08T02:15:03.123Z-12345
  fechaISO: string;           // new Date().toISOString()
  usuario?: UsuarioPedidoMeta;
  opcionRetiro?: string;      // retiro en tienda / delivery / etc
  items: ItemPedido[];
  subtotal: number;
  total: number;
}

// Claves LS
const LS_CARRITO = 'carrito';
const LS_IDX_PEDIDOS = 'bk_pedidos_index'; // array de {id,key,fechaISO,usuario?}
const LS_PED_PREFIX = 'bk_pedido_';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  // Productos (BehaviorSubject para que componentes puedan suscribirse)
  private productosSubject = new BehaviorSubject<any[]>(this.cargarDesdeLocal());
  productos$ = this.productosSubject.asObservable();

  // Visible (panel desplegable)
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  // Contador total
  private contadorSubject = new BehaviorSubject<number>(this.calcularContador(this.productosSubject.value));
  contador$ = this.contadorSubject.asObservable();

  constructor() {}

  // ====== API de carrito existente ======
  agregarProducto(producto: any): void {
    const actuales = [...this.productosSubject.value];
    const idx = actuales.findIndex(p =>
      p.nombre === producto.nombre &&
      JSON.stringify(p.personalizaciones || {}) === JSON.stringify(producto.personalizaciones || {}));

    if (idx !== -1) actuales[idx].cantidad = (actuales[idx].cantidad || 0) + (producto.cantidad || 1);
    else actuales.push({ ...producto, cantidad: producto.cantidad || 1 });

    this.productosSubject.next(actuales);
    this.guardarEnLocal(actuales);
    this.actualizarContador(actuales);
  }

  setProductos(productos: any[]): void {
    this.productosSubject.next(productos);
    this.guardarEnLocal(productos);
    this.actualizarContador(productos);
  }

  eliminarProducto(index: number): void {
    const actuales = [...this.productosSubject.value];
    if (index >= 0 && index < actuales.length) {
      actuales.splice(index, 1);
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    }
  }

  vaciarCarrito(): void {
    this.productosSubject.next([]);
    localStorage.removeItem(LS_CARRITO);
    this.actualizarContador([]);
  }

  obtenerProductosSnapshot(): any[] {
    return this.productosSubject.value;
  }

  toggleVisible(): void { this.visibleSubject.next(!this.visibleSubject.value); }
  abrirCarrito(): void { this.visibleSubject.next(true); }
  cerrarCarrito(): void { this.visibleSubject.next(false); }

  // ====== NUEVO: Confirmar pedido y persistir ======
  /**
   * Crea un pedido en localStorage:
   *  - key: `bk_pedido_<id>`
   *  - agrega entrada en `bk_pedidos_index`
   * Devuelve { id, key }. Si el carrito está vacío, devuelve null.
   */
  confirmarPedido(opcionRetiro?: string, usuario?: UsuarioPedidoMeta): { id: string; key: string } | null {
    const items: ItemPedido[] = this.obtenerProductosSnapshot().map(p => ({
      nombre: p.nombre,
      precio: Number(p.precio) || 0,
      cantidad: Number(p.cantidad) || 1,
      imagen: p.imagen,
      personalizaciones: p.personalizaciones
    }));

    if (!items.length) return null;

    const subtotal = items.reduce((s, it) => s + it.precio * it.cantidad, 0);
    const total = subtotal; // aquí podrías aplicar códigos/promos si corresponde

    const id = this.generarIdPedido();
    const key = `${LS_PED_PREFIX}${id}`;
    const fechaISO = new Date().toISOString();

    const pedido: Pedido = {
      id,
      fechaISO,
      usuario,
      opcionRetiro,
      items,
      subtotal,
      total
    };

    // Guarda pedido individual
    try {
      localStorage.setItem(key, JSON.stringify(pedido));
    } catch (e) {
      console.warn('No se pudo guardar el pedido en localStorage', e);
      return null;
    }

    // Actualiza índice
    try {
      const idx = this.leerIndice();
      idx.push({
        id,
        key,
        fechaISO,
        usuario
      });
      localStorage.setItem(LS_IDX_PEDIDOS, JSON.stringify(idx));
    } catch (e) {
      console.warn('No se pudo actualizar índice de pedidos', e);
    }

    return { id, key };
  }

  // ===== Helpers de persistencia =====
  private guardarEnLocal(productos: any[]): void {
    try { localStorage.setItem(LS_CARRITO, JSON.stringify(productos)); }
    catch (e) { console.warn('No se pudo guardar carrito en localStorage', e); }
  }

  private cargarDesdeLocal(): any[] {
    try {
      const raw = localStorage.getItem(LS_CARRITO);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private actualizarContador(productos: any[]): void {
    this.contadorSubject.next(this.calcularContador(productos));
  }

  private calcularContador(productos: any[]): number {
    return productos.reduce((s, p) => s + (p.cantidad || 0), 0);
  }

  private generarIdPedido(): string {
    // Ej: PED-2025-12-08T02:15:03.123Z-48219
    const rnd = Math.floor(Math.random() * 100000);
    return `PED-${new Date().toISOString()}-${rnd}`;
    // si quieres algo más corto: return `PED-${Date.now()}-${rnd}`
  }

  private leerIndice(): Array<{id:string; key:string; fechaISO:string; usuario?:UsuarioPedidoMeta}> {
    try {
      return JSON.parse(localStorage.getItem(LS_IDX_PEDIDOS) || '[]');
    } catch { return []; }
  }
}
