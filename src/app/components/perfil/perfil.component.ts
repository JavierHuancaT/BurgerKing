import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { PedidosService, PedidoIndice, PedidoDetalle } from 'src/app/services/pedidos.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario = this.auth.getCurrentUser();
  pedidos: PedidoIndice[] = [];
  detalleSeleccionado: PedidoDetalle | null = null;

  constructor(private auth: AuthService, private pedidosSrv: PedidosService, private router: Router) {}

  ngOnInit(): void {
    if (!this.usuario) { this.router.navigate(['/auth/login']); return; }
    this.pedidos = this.pedidosSrv.obtenerPorUsuario(this.usuario.id);
    this.enriquecerTotales();
  }

  verDetalle(pedidoId: string) {
    this.detalleSeleccionado = this.pedidosSrv.obtenerDetallePorId(pedidoId);
  }

  /**
   * Si total o itemCount faltan (o son 0) en el índice,
   * los calculamos leyendo el detalle del pedido.
   */
  private enriquecerTotales() {
    this.pedidos = this.pedidos.map(p => {
      const faltaTotal = !p.total || p.total <= 0;
      const faltaCount = !p.itemCount || p.itemCount <= 0;
      if (!faltaTotal && !faltaCount) return p;

      const det = this.pedidosSrv.obtenerDetallePorId(p.id);
      if (!det) return p;

      const itemCount = det.items?.reduce((s, it) => s + (it.cantidad || 0), 0) || 0;
      const total = typeof det.total === 'number'
        ? det.total
        : det.items?.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0) || 0;

      return { ...p, total, itemCount };
    });
  }
}
