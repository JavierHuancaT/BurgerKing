import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  items$: Observable<Product[]>;

  constructor(private productSrv: ProductService, private router: Router) {
    this.items$ = this.productSrv.items$;
  }

  onDelete(id: string, name: string) {
    const ok = confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.productSrv.remove(id); // HDU6
  }
}
