import { Component } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';
import { PromocionService } from '../../services/promocion.service';

type ComboVM = {
  id: string;
  nombre: string;
  imagen?: string;
  descripcion?: string;
  precio: number;        // base
  // promo
  precioOferta: number;  // mostrado/efectivo
  descuento: number;     // %
};

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  // Se recomputa cuando cambian productos O promociones
  combos$: Observable<ComboVM[]> = combineLatest([
    this.products.items$,
    this.promos.items$
  ]).pipe(
    map(([items]) =>
      items.map((p: Product) => {
        const { precioOferta, descuento } = this.promos.precioConPromo(p.basePrice, p.id);
        return {
          id: p.id,
          nombre: p.name,
          imagen: p.imageData,
          descripcion: p.descripcion,
          precio: p.basePrice,
          precioOferta,
          descuento
        };
      })
    )
  );

  trackById = (_: number, it: { id: string }) => it.id;

  constructor(
    private products: ProductService,
    private promos: PromocionService
  ) {}
}
