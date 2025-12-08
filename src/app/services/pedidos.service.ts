import { Injectable } from '@angular/core';

export type UsuarioMeta = { id?: string; nombre?: string; email?: string };
export type PedidoIndice = {
  id: string;
  key: string;
  fechaISO: string;
  usuario?: UsuarioMeta;
  total?: number;
  itemCount?: number;
  opcionRetiro?: string;
};
export type ItemPedido = { nombre: string; precio: number; cantidad: number; imagen?: string; personalizaciones?: any };
export type PedidoDetalle = {
  id: string;
  fechaISO: string;
  usuario?: UsuarioMeta;
  opcionRetiro?: string;
  items: ItemPedido[];
  subtotal: number;
  total: number;
};

const LS_IDX = 'bk_pedidos_index';
const LS_PED_PREFIX = 'bk_pedido_';

@Injectable({ providedIn: 'root' })
export class PedidosService {

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
    // busca la key en el índice y luego lee el detalle
    const entrada = this.obtenerIndice().find(p => p.id === pedidoId);
    const key = entrada?.key ?? `${LS_PED_PREFIX}${pedidoId}`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as PedidoDetalle : null;
    } catch { return null; }
  }
}
