import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ===== Tipos para pedidos =====
export type PedidoEstado =
  | 'PENDIENTE' | 'EN_COCINA' | 'LISTO' | 'EN_REPARTO' | 'COMPLETADO' | 'CANCELADO';

export interface ItemPedido {
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  personalizaciones?: any;
}

export interface UsuarioPedidoMeta {
  id?: string;
  nombre?: string;
  email?: string;
}

export interface Pedido {
  id: string;                 // p.ej. PED-2025-12-08T02:15:03.123Z-12345
  fechaISO: string;
  usuario?: UsuarioPedidoMeta;
  opcionRetiro?: string;
  items: ItemPedido[];
  subtotal: number;
  total: number;
  estado: PedidoEstado;       // nuevo en el detalle
}

// Estructura de cada fila en el índice (bk_pedidos_index)
type PedidoIndexRow = {
  id: string;
  key: string;
  fechaISO: string;
  usuario?: UsuarioPedidoMeta;
  total?: number;
  itemCount?: number;
  opcionRetiro?: string;
  estado?: PedidoEstado;      // nuevo en el índice
};

// Claves de LS
const LS_CARRITO = 'carrito';
const LS_IDX_PEDIDOS = 'bk_pedidos_index';
const LS_PED_PREFIX = 'bk_pedido_';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  // Productos
  private productosSubject = new BehaviorSubject<any[]>(this.cargarDesdeLocal());
  productos$ = this.productosSubject.asObservable();

  // Visible (panel)
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  // Contador
  private contadorSubject = new BehaviorSubject<number>(
    this.calcularContador(this.productosSubject.value)
  );
  contador$ = this.contadorSubject.asObservable();

  constructor() {}

  // ====== API carrito ======

  agregarProducto(producto: any): void {
    const actuales = [...this.productosSubject.value];
    
    // Intentamos buscar si existe un producto idéntico (misma ID base, nombre y personalizaciones)
    const idx = actuales.findIndex(
      p =>
        p.productId === (producto.productId || producto.id) &&
        p.nombre === producto.nombre &&
        JSON.stringify(p.personalizaciones || {}) ===
          JSON.stringify(producto.personalizaciones || {})
    );

    if (idx !== -1) {
      // Si existe, solo aumentamos cantidad
      actuales[idx].cantidad =
        (actuales[idx].cantidad || 0) + (producto.cantidad || 1);
    } else {
      // AL AGREGAR NUEVO, ASIGNAMOS UN ID ÚNICO DE CARRITO (cartItemId)
      // Esto es vital para poder editarlo después sin confundirlo con otros iguales.
      actuales.push({ 
        ...producto, 
        cartItemId: producto.cartItemId || `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
        productId: producto.productId || producto.id,
        cantidad: producto.cantidad || 1 
      });
    }

    this.productosSubject.next(actuales);
    this.guardarEnLocal(actuales);
    this.actualizarContador(actuales);
  }

  // <--- NUEVO MÉTODO PARA ACTUALIZAR UN PRODUCTO EXISTENTE (Modo Edición)
  actualizarProducto(productoEditado: any): void {
    const actuales = [...this.productosSubject.value];
    
    // Buscamos específicamente por el ID ÚNICO DEL CARRITO (cartItemId)
    const idx = actuales.findIndex(p => p.cartItemId === productoEditado.cartItemId);

    if (idx !== -1) {
      // Reemplazamos el objeto completo con la nueva versión editada
      actuales[idx] = productoEditado;
      
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    } else {
      // Fallback: Si por alguna razón no se encuentra, lo agregamos como nuevo
      this.agregarProducto(productoEditado);
    }
  }

  // <--- NUEVO MÉTODO PARA OBTENER UN ITEM POR SU ID DE CARRITO
  // Útil para pre-cargar el formulario cuando le das a "Editar"
  obtenerItemPorId(cartItemId: string): any | undefined {
    return this.productosSubject.value.find(p => p.cartItemId === cartItemId);
  }

  // Actualizar cantidad de un producto específico (por índice)
  actualizarCantidad(index: number, nuevaCantidad: number): void {
    const actuales = [...this.productosSubject.value];
    if (index >= 0 && index < actuales.length && nuevaCantidad > 0) {
      actuales[index].cantidad = nuevaCantidad;
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    } else if (nuevaCantidad <= 0) {
      // Si la cantidad llega a 0, eliminar el producto
      this.eliminarProducto(index);
    }
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

  // ====== Confirmar pedido y persistir ======
  /**
   * Crea un pedido:
   * - Detalle en `bk_pedido_<id>`
   * - Fila en `bk_pedidos_index`
   * Devuelve { id, key } o null si el carrito está vacío.
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
    const total = subtotal; // aquí puedes aplicar cupones/promos si corresponde
    const estadoInicial: PedidoEstado = 'PENDIENTE';

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
      total,
      estado: estadoInicial, // guardamos el estado en el detalle
    };

    // Detalle
    try {
      localStorage.setItem(key, JSON.stringify(pedido));
    } catch (e) {
      console.warn('No se pudo guardar el pedido en localStorage', e);
      return null;
    }

    // Índice
    try {
      const idx = this.leerIndice();
      idx.push({
        id,
        key,
        fechaISO,
        usuario,
        total,
        itemCount: items.length,
        opcionRetiro,
        estado: estadoInicial, // y también en el índice
      });
      localStorage.setItem(LS_IDX_PEDIDOS, JSON.stringify(idx));

      // Opcional: notificación en la misma pestaña (para “tiempo real”)
      window.dispatchEvent(new Event('bk-pedidos-changed'));
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
    const rnd = Math.floor(Math.random() * 100000);
    return `PED-${new Date().toISOString()}-${rnd}`;
  }

  private leerIndice(): PedidoIndexRow[] {
    try {
      return JSON.parse(localStorage.getItem(LS_IDX_PEDIDOS) || '[]') as PedidoIndexRow[];
    } catch {
      return [];
    }
  }
}