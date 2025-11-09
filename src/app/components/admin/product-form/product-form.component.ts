import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  editId: string | null = null;   // null = crear, string = editar

  constructor(
    private fb: FormBuilder,
    private srv: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const p = this.srv.findById(id);
      if (p) {
        this.editId = id;
        this.form.patchValue({
          name: p.name,
          basePrice: p.basePrice,
          stock: p.stock
        });
      } else {
        // id no válido: vuelve a la lista
        this.router.navigate(['/admin/products']);
      }
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, basePrice, stock } = this.form.value;

    if (this.editId) {
      // HDU7 — editar
      this.srv.update(this.editId, {
        name: name!, basePrice: Number(basePrice), stock: Number(stock)
      });
    } else {
      // HDU4 — crear
      this.srv.add({
        name: name!, basePrice: Number(basePrice), stock: Number(stock)
      });
    }
    this.router.navigate(['/admin/products']);
  }
}
