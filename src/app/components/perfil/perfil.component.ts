import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { PedidosService, PedidoIndice, PedidoDetalle } from 'src/app/services/pedidos.service';

type PedidoEstado = 'PENDIENTE' | 'EN_COCINA' | 'LISTO' | 'EN_REPARTO' | 'COMPLETADO' | 'CANCELADO';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {

  usuario = this.auth.getCurrentUser();
  pedidos: (PedidoIndice & { opcionRetiro?: string })[] = [];
  detalleSeleccionado: (PedidoDetalle & { subtotal?: number }) | null = null;

  private onStorage = () => {
    // refresca la lista cuando el admin o el sistema cambien estados
    this.refrescar();
  };

  constructor(
    private auth: AuthService,
    private pedidosSrv: PedidosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.usuario) { this.router.navigate(['/auth/login']); return; }
    this.refrescar();
    // tiempo real (misma pestaña / otras pestañas)
    window.addEventListener('storage', this.onStorage);
    window.addEventListener('bk-pedidos-changed', this.onStorage as any);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorage);
    window.removeEventListener('bk-pedidos-changed', this.onStorage as any);
  }

  private refrescar(): void {
    this.pedidos = this.pedidosSrv.obtenerPorUsuario(this.usuario!.id);
    this.enriquecerTotalesYEstado();
    if (this.detalleSeleccionado) {
      // si hay un detalle abierto, recárgalo para ver estado actualizado
      this.verDetalle(this.detalleSeleccionado.id);
    }
  }

  verDetalle(pedidoId: string) {
    const d = this.pedidosSrv.obtenerDetallePorId(pedidoId);
    if (d) {
      // Calcular subtotal y total con envío
      const subtotal = d.items?.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0) ?? 0;
      const costoEnvio = d.opcionRetiro === 'Delivery' ? 2500 : 0;
      const total = subtotal + costoEnvio;
      this.detalleSeleccionado = { ...d, subtotal, total };
    } else {
      this.detalleSeleccionado = null;
    }
  }

  /** Si total / itemCount faltan en el índice, los completamos leyendo el detalle.
   *  También completamos el estado si no viniera en el índice.
   */
  private enriquecerTotalesYEstado() {
    this.pedidos = this.pedidos.map(p => {
      const det = (!p.total || !p.itemCount || (p as any).estado == null || !(p as any).opcionRetiro)
        ? this.pedidosSrv.obtenerDetallePorId(p.id)
        : null;

      const itemCount = p.itemCount && p.itemCount > 0
        ? p.itemCount
        : (det?.items?.reduce((s, it) => s + (it.cantidad || 0), 0) ?? 0);

      const opcionRetiro = (p as any).opcionRetiro || (det as any)?.opcionRetiro;
      const costoEnvio = opcionRetiro === 'Delivery' ? 2500 : 0;

      const subtotal = (det && det.items)
        ? det.items.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0)
        : (p.total || 0);

      const total = subtotal + costoEnvio;

      const estado = (p as any).estado ?? (det as any)?.estado ?? 'PENDIENTE';

      return { ...p, total, itemCount, estado, opcionRetiro } as PedidoIndice & { estado: PedidoEstado, opcionRetiro?: string };
    });
  }

  // ===== UI helpers =====
  estadoLabel(e?: string): string {
    switch ((e || 'PENDIENTE') as PedidoEstado) {
      case 'PENDIENTE':  return 'Pendiente';
      case 'EN_COCINA':  return 'En cocina';
      case 'LISTO':      return 'Listo';
      case 'EN_REPARTO': return 'En reparto';
      case 'COMPLETADO': return 'Completado';
      case 'CANCELADO':  return 'Cancelado';
      default:           return 'Pendiente';
    }
  }

  estadoBadgeClass(e?: string): string {
    switch ((e || 'PENDIENTE') as PedidoEstado) {
      case 'PENDIENTE':  return 'bg-warning text-dark';
      case 'EN_COCINA':  return 'bg-info text-dark';
      case 'LISTO':      return 'bg-primary';
      case 'EN_REPARTO': return 'bg-secondary';
      case 'COMPLETADO': return 'bg-success';
      case 'CANCELADO':  return 'bg-danger';
      default:           return 'bg-warning text-dark';
    }
  }

  estadoDe(obj: unknown): string {
  // intenta leer "estado" y cae en 'PENDIENTE' si no existe
  const e = (obj as any)?.estado;
  return typeof e === 'string' && e.length ? e : 'PENDIENTE';
  }
}
