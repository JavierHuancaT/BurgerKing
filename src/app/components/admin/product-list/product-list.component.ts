import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  items$: Observable<Product[]> = this.productSrv.items$;

  constructor(private productSrv: ProductService) {}
}
