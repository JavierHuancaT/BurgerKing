import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth.service'; // <--- IMPORTACIÓN DEL AUTH SERVICE

// ==========================================
// TIPOS Y ESTADOS DE PEDIDOS
// ==========================================
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
  id: string;                 
  fechaISO: string;
  usuario?: UsuarioPedidoMeta;
  opcionRetiro?: string;
  items: ItemPedido[];
  subtotal: number;
  total: number;
  estado: PedidoEstado;       
}

type PedidoIndexRow = {
  id: string;
  key: string;
  fechaISO: string;
  usuario?: UsuarioPedidoMeta;
  total?: number;
  itemCount?: number;
  opcionRetiro?: string;
  estado?: PedidoEstado;      
};

// Claves base de LS (Nota: LS_CARRITO ya no es fija, es dinámica)
const LS_IDX_PEDIDOS = 'bk_pedidos_index';
const LS_PED_PREFIX = 'bk_pedido_';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  
  // <--- Variable para guardar el ID del usuario actual (o null si es invitado)
  private currentUserId: string | null = null;

  // Productos (Inicializamos vacío, esperaremos al Auth para cargar los correctos)
  private productosSubject = new BehaviorSubject<any[]>([]);
  productos$ = this.productosSubject.asObservable();

  // Estado visual del panel (abierto/cerrado)
  private visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  // Contador total de ítems
  private contadorSubject = new BehaviorSubject<number>(0);
  contador$ = this.contadorSubject.asObservable();

  constructor(
    private authService: AuthService // <--- INYECCIÓN REAL
  ) {
    // <--- SUSCRIPCIÓN REACTIVA AL USUARIO
    // Cada vez que alguien hace login o logout, esto se ejecuta automáticamente.
    // Esto permite cambiar el "cajón" del carrito en tiempo real.
    this.authService.currentUser$.subscribe(user => {
      // 1. Actualizamos el ID local en el servicio
      this.currentUserId = user ? user.id : null; 
      
      // 2. Recargamos el carrito usando la nueva clave (Guest o UserID)
      const productosDelUsuario = this.cargarDesdeLocal();
      
      // 3. Emitimos los nuevos productos para que la vista se actualice
      this.productosSubject.next(productosDelUsuario);
      this.actualizarContador(productosDelUsuario);
    });
  }

  // <--- GENERADOR DE CLAVE DINÁMICA
  // Esta es la magia: decide en qué clave del localStorage guardar las cosas.
  // Si hay usuario logueado -> 'carrito_user_123'
  // Si es invitado -> 'carrito_guest'
  private getStorageKey(): string {
    if (this.currentUserId) {
      return `carrito_user_${this.currentUserId}`; 
    }
    return 'carrito_guest'; // Carrito por defecto si no hay login
  }

  // ==========================================
  // API DEL CARRITO (CRUD)
  // ==========================================

  agregarProducto(producto: any): void {
    const actuales = [...this.productosSubject.value];
    
    // Intentamos buscar si existe un producto idéntico (mismo ID y mismas personalizaciones)
    // para agruparlos visualmente si el usuario así lo desea (aunque con el Wizard casi siempre serán únicos)
    const idx = actuales.findIndex(
      p =>
        p.productId === (producto.productId || producto.id) &&
        p.nombre === producto.nombre &&
        JSON.stringify(p.personalizaciones || {}) ===
          JSON.stringify(producto.personalizaciones || {})
    );

    if (idx !== -1) {
      // Si existe idéntico, solo aumentamos cantidad
      actuales[idx].cantidad = (actuales[idx].cantidad || 0) + (producto.cantidad || 1);
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

  actualizarProducto(productoEditado: any): void {
    const actuales = [...this.productosSubject.value];
    // Buscamos por el ID único de la fila del carrito
    const idx = actuales.findIndex(p => p.cartItemId === productoEditado.cartItemId);

    if (idx !== -1) {
      actuales[idx] = productoEditado;
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    } else {
      // Fallback: Si no se encuentra, lo agregamos como nuevo
      this.agregarProducto(productoEditado);
    }
  }

  // <--- MÉTODO VITAL PARA EL WIZARD
  // Permite borrar un "pack" antiguo antes de agregar los productos desglosados individualmente.
  eliminarPorId(cartItemId: string): void {
    const actuales = [...this.productosSubject.value];
    const index = actuales.findIndex(p => p.cartItemId === cartItemId);

    if (index !== -1) {
      actuales.splice(index, 1);
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    }
  }

  obtenerItemPorId(cartItemId: string): any | undefined {
    return this.productosSubject.value.find(p => p.cartItemId === cartItemId);
  }

  // Actualizar cantidad simple (+ / -) desde el panel del carrito
  actualizarCantidad(index: number, nuevaCantidad: number): void {
    const actuales = [...this.productosSubject.value];
    if (index >= 0 && index < actuales.length && nuevaCantidad > 0) {
      actuales[index].cantidad = nuevaCantidad;
      this.productosSubject.next(actuales);
      this.guardarEnLocal(actuales);
      this.actualizarContador(actuales);
    } else if (nuevaCantidad <= 0) {
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
    // <--- IMPORTANTE: Borramos solo la clave del usuario actual
    localStorage.removeItem(this.getStorageKey());
    this.actualizarContador([]);
  }

  obtenerProductosSnapshot(): any[] {
    return this.productosSubject.value;
  }

  // Control visual del panel lateral
  toggleVisible(): void { this.visibleSubject.next(!this.visibleSubject.value); }
  abrirCarrito(): void { this.visibleSubject.next(true); }
  cerrarCarrito(): void { this.visibleSubject.next(false); }

  // ==========================================
  // CONFIRMACIÓN Y PERSISTENCIA DE PEDIDOS
  // ==========================================
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
    const total = subtotal; 
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
      estado: estadoInicial, 
    };

    // Guardamos el detalle del pedido
    try {
      localStorage.setItem(key, JSON.stringify(pedido));
    } catch (e) {
      console.warn('No se pudo guardar el pedido en localStorage', e);
      return null;
    }

    // Guardamos en el índice general de pedidos
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
        estado: estadoInicial, 
      });
      localStorage.setItem(LS_IDX_PEDIDOS, JSON.stringify(idx));

      window.dispatchEvent(new Event('bk-pedidos-changed'));
    } catch (e) {
      console.warn('No se pudo actualizar índice de pedidos', e);
    }

    return { id, key };
  }

  // ==========================================
  // HELPERS PRIVADOS (PERSISTENCIA)
  // ==========================================
  
  private guardarEnLocal(productos: any[]): void {
    try { 
      // <--- USAMOS LA CLAVE DINÁMICA
      localStorage.setItem(this.getStorageKey(), JSON.stringify(productos)); 
    }
    catch (e) { console.warn('No se pudo guardar carrito en localStorage', e); }
  }

  private cargarDesdeLocal(): any[] {
    try {
      // <--- USAMOS LA CLAVE DINÁMICA
      const raw = localStorage.getItem(this.getStorageKey());
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