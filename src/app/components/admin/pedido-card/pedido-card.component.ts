import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PedidoDetalle } from 'src/app/services/pedidos.service';

export type PedidoEstado = 'PENDIENTE'|'EN_COCINA'|'LISTO'|'COMPLETADO'|'CANCELADO';

@Component({
  selector: 'app-pedido-card',
  templateUrl: './pedido-card.component.html',
  styleUrls: ['./pedido-card.component.css']
})
export class PedidoCardComponent {
  @Input() pedido!: PedidoDetalle;

  // 👇 nombres que ya escuchas en el padre
  @Output() avanzar = new EventEmitter<void>();
  @Output() cambiarEstado = new EventEmitter<PedidoEstado>();

  estados: PedidoEstado[] = ['PENDIENTE','EN_COCINA','LISTO','COMPLETADO','CANCELADO'];

  totalFmt(n: number) {
    return n.toLocaleString('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
  }

  onEstadoChange(ev: Event) {
    const sel = ev.target as HTMLSelectElement;
    this.cambiarEstado.emit(sel.value as PedidoEstado);
  }
}
