// importa el tipo desde el hijo, o decláralo aquí
// import { PedidoEstado } from '../pedido-card/pedido-card.component';
type PedidoEstado = 'PENDIENTE'|'EN_COCINA'|'LISTO'|'EN_REPARTO'|'COMPLETADO'|'CANCELADO';

import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PedidosService, PedidoDetalle } from 'src/app/services/pedidos.service';

@Component({
  selector: 'app-gestion-pedidos',
  templateUrl: './gestion-pedidos.component.html',
  styleUrls: ['./gestion-pedidos.component.css']
})
export class GestionPedidosComponent implements OnDestroy {
  pendientes$!: Observable<PedidoDetalle[]>;
  cocina$!: Observable<PedidoDetalle[]>;
  listos$!: Observable<PedidoDetalle[]>;
  done$!: Observable<PedidoDetalle[]>;
  private sub?: Subscription;

  constructor(private pedidos: PedidosService) {
    this.pendientes$ = this.pedidos.byEstado$('PENDIENTE');
    this.cocina$     = this.pedidos.byEstado$('EN_COCINA');
    this.listos$     = this.pedidos.byEstado$('LISTO');
    this.done$       = this.pedidos.byEstado$('COMPLETADO');
  }

  trackById = (_: number, p: PedidoDetalle) => p.id;

  avanzar(p: PedidoDetalle) {
    const flow: PedidoEstado[] = ['PENDIENTE','EN_COCINA','LISTO','COMPLETADO'];
    const i = flow.indexOf(p.estado as PedidoEstado);
    const next = flow[Math.min(Math.max(i,0)+1, flow.length-1)];
    this.pedidos.actualizarEstado(p.id, next);
  }

  // 👇 antes: setEstado(p: PedidoDetalle, e: Event)
  setEstado(p: PedidoDetalle, estado: PedidoEstado) {
    this.pedidos.actualizarEstado(p.id, estado);
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
