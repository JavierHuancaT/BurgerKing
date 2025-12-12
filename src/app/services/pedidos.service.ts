import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

// ===== Tipos existentes + ampliaciones =====
export type UsuarioMeta = { id?: string; nombre?: string; email?: string };

export type PedidoIndice = {
  id: string;
  key: string;
  fechaISO: string;
  usuario?: UsuarioMeta;
  total?: number;
  itemCount?: number;
  opcionRetiro?: string;
  // (no agregamos estado aquí para no romper datos ya guardados)
};

export type ItemPedido = {
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  personalizaciones?: any;
};

export type PedidoEstado =
  | 'PENDIENTE'
  | 'EN_COCINA'
  | 'LISTO'
  | 'EN_REPARTO'
  | 'COMPLETADO'
  | 'CANCELADO';

export type PedidoDetalle = {
  id: string;
  fechaISO: string;
  usuario?: UsuarioMeta;
  opcionRetiro?: string;
  items: ItemPedido[];
  subtotal: number;
  total: number;
  // 👇 NUEVO: estado (con default al normalizar si faltara)
  estado?: PedidoEstado;
};

const LS_IDX = 'bk_pedidos_index';
const LS_PED_PREFIX = 'bk_pedido_';
const PING_KEY = 'bk_pedidos_ping';

@Injectable({ providedIn: 'root' })
export class PedidosService {

  constructor(private auth: AuthService) {
    // “Tiempo real” entre pestañas/ventanas
    if ('BroadcastChannel' in window) {
      this.bc = new BroadcastChannel('bk_pedidos');
      this.bc.onmessage = (ev) => { if (ev?.data === 'refresh') this.refrescar(); };
    }
    window.addEventListener('storage', (e) => {
      if (e.key === LS_IDX || e.key === PING_KEY) this.refrescar();
    });
  }

  // ========= API ORIGINAL (se mantiene) =========
  obtenerIndice(): PedidoIndice[] {
    try { return JSON.parse(localStorage.getItem(LS_IDX) || '[]'); }
    catch { return []; }
  }

  obtenerPorUsuario(userId?: string): PedidoIndice[] {
    const idx = this.obtenerIndice();
    if (!userId) return [];
    return idx.filter(p => p.usuario?.id === userId);
  }

  obtenerDetallePorId(pedidoId: string): PedidoDetalle | null {
    const entrada = this.obtenerIndice().find(p => p.id === pedidoId);
    const key = entrada?.key ?? `${LS_PED_PREFIX}${pedidoId}`;
    try {
      const raw = localStorage.getItem(key);
      const det = raw ? JSON.parse(raw) as PedidoDetalle : null;
      return det ? this.normalizeDetalle(det) : null;
    } catch { return null; }
  }

  // ========= NUEVO: stream “tiempo real” + helpers =========
  private pedidosSubject = new BehaviorSubject<PedidoDetalle[]>(this.cargarTodosDetalles());
  public pedidos$ = this.pedidosSubject.asObservable();

  /** Devuelve un stream filtrado por estado, ordenado (más reciente primero). */
  byEstado$(estado: PedidoEstado): Observable<PedidoDetalle[]> {
    return this.pedidos$.pipe(
      map(arr => arr
        .filter(p => (p.estado ?? 'PENDIENTE') === estado)
        .sort((a,b) => b.fechaISO.localeCompare(a.fechaISO)))
    );
  }

  /** Crear pedido (usa usuario actual del AuthService). */
  crearPedido(items: ItemPedido[], opcionRetiro?: string): PedidoDetalle {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const now = new Date();
    const id  = 'PED-' + now.toISOString().replace(/[:.]/g,'').replace('T','_').slice(0,15);
    const key = LS_PED_PREFIX + id;

    const subtotal = items.reduce((s,p) => s + (p.precio||0)*(p.cantidad||1), 0);
    const total = subtotal; // si luego agregas delivery/propina/impuestos, ajusta acá

    const detalle: PedidoDetalle = this.normalizeDetalle({
      id,
      fechaISO: now.toISOString(),
      usuario: { id: user.id, nombre: user.name, email: user.email },
      opcionRetiro,
      items,
      subtotal,
      total,
      estado: 'PENDIENTE'
    });

    // 1) Guardar detalle
    localStorage.setItem(key, JSON.stringify(detalle));

    // 2) Actualizar índice
    const idx = this.obtenerIndice();
    if (!idx.find(x => x.id === id)) {
      idx.push({
        id,
        key,
        fechaISO: detalle.fechaISO,
        usuario: detalle.usuario,
        total: detalle.total,
        itemCount: items.reduce((s,p)=>s+(p.cantidad||1),0),
        opcionRetiro: detalle.opcionRetiro
      });
      localStorage.setItem(LS_IDX, JSON.stringify(idx));
    }

    // 3) Emitir en vivo
    this.pedidosSubject.next([detalle, ...this.pedidosSubject.value]);
    this.ping();
    return detalle;
  }

  /** Cambiar estado de un pedido (y notificar). */
  actualizarEstado(pedidoId: string, nuevo: PedidoEstado): void {
    const entrada = this.obtenerIndice().find(p => p.id === pedidoId);
    const key = entrada?.key ?? `${LS_PED_PREFIX}${pedidoId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    const det = this.normalizeDetalle(JSON.parse(raw));
    det.estado = nuevo;
    localStorage.setItem(key, JSON.stringify(det));

    const lista = this.pedidosSubject.value.map(p => p.id === pedidoId ? det : p);
    this.pedidosSubject.next(lista);
    this.ping();
  }

  // ========= Internos =========
  private bc?: BroadcastChannel;

  private normalizeDetalle(det: PedidoDetalle): PedidoDetalle {
    return {
      ...det,
      estado: (det.estado ?? 'PENDIENTE')
    };
  }

  private cargarTodosDetalles(): PedidoDetalle[] {
    const idx = this.obtenerIndice();
    const out: PedidoDetalle[] = [];
    for (const { key } of idx) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try { out.push(this.normalizeDetalle(JSON.parse(raw))); } catch {}
      }
    }
    return out.sort((a,b) => b.fechaISO.localeCompare(a.fechaISO));
  }

  private refrescar() {
    this.pedidosSubject.next(this.cargarTodosDetalles());
  }

  private ping() {
    if (this.bc) this.bc.postMessage('refresh');
    try { localStorage.setItem(PING_KEY, String(Date.now())); } catch {}
  }
}
