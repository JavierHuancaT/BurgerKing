import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService, Product } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  items$: Observable<Product[]> = this.productSrv.items$;
  constructor(private productSrv: ProductService, private router: Router) {}

  onDelete(id: string, name: string) {
    const ok = confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.productSrv.remove(id); // HDU6
  }
}
