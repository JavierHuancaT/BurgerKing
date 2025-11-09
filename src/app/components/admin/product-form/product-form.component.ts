import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private fb: FormBuilder,
    private srv: ProductService,
    private router: Router
  ) {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, basePrice, stock } = this.form.value;
    this.srv.add({
      name: name!,
      basePrice: Number(basePrice),
      stock: Number(stock)
    });
    this.router.navigate(['/admin/products']);
  }
}
