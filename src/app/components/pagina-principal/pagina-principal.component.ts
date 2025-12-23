import { Component } from '@angular/core';

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  selectedComboId: string | null = null;

  combos$: Observable<ComboConPromo[]> = combineLatest([
    this.products.items$,
    this.promos.items$
  ]).pipe(
    map(([products, _]) =>
      products.map((p: Product): ComboConPromo => {
        const { precioOferta, descuento } = this.promos.precioConPromo(p.basePrice, p.id);
        return {
          ...p,
          precioOferta,
          descuento
        };
      })
    )
  );

  trackById = (_: number, it: { id: string }) => it.id;

  constructor(
    private products: ProductService,
    private promos: PromocionService,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  selectCombo(comboId: string) {
    this.selectedComboId = this.selectedComboId === comboId ? null : comboId;
  }

  personalize(combo: ComboConPromo) {
    this.router.navigate(['/personalizar', combo.id]);
  }

  addToCart(combo: ComboConPromo) {
    const item: ItemCarrito = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      productId: combo.id,
      nombre: combo.name,
      precio: combo.precioOferta,
      cantidad: 1,
      imagen: combo.imageData ?? ''
    };
    this.carritoService.agregarProducto(item);
    this.router.navigate(['/']);
  }

  editProduct(combo: ComboConPromo) {
    this.router.navigate(['/admin/products', combo.id, 'edit']);
  }
}
