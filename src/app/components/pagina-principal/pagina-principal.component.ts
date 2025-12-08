import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';

type ComboVM = {
  id: string;
  nombre: string;
  imagen?: string;         // DataURL (base64) opcional
  descripcion?: string;    // si no tienes, puedes dejar vacío o generar una
  precio: number;          // precio numérico para formatear en template
};

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  /** Stream que mapea los Product a la vista de “combos” */
  combos$: Observable<ComboVM[]> = this.products.items$.pipe(
    map((items: Product[]) =>
      items.map(p => ({
        id: p.id,
        nombre: p.name,
        imagen: p.imageData,                // Data URL guardada por el Admin (si existe)
        descripcion: p.descripcion,                    // <- si no manejan descripción, lo dejamos vacío
        precio: p.basePrice
      }))
    )
  );
  trackById = (_: number, it: { id: string }) => it.id;

  constructor(private products: ProductService) {}
}
