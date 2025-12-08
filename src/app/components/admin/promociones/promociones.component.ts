import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PromocionService } from '../../../services/promocion.service';
import { ProductService, Product } from '../../../services/product.service';
import { Observable } from 'rxjs';
import { Promocion } from 'src/app/models/promocion.module';

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.css']
})
export class PromocionesComponent {
  productos$: Observable<Product[]> = this.productSrv.items$;
  promociones$: Observable<Promocion[]> = this.promoSrv.items$;

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    descuentoPorc: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    productosIds: this.fb.control<string[]>([])
  });

  constructor(
    private fb: FormBuilder,
    private promoSrv: PromocionService,
    private productSrv: ProductService
  ) {}

  toggleProducto(id: string, checked: boolean) {
    const set = new Set(this.form.value.productosIds ?? []);
    checked ? set.add(id) : set.delete(id);
    this.form.patchValue({ productosIds: Array.from(set) });
  }

  crear() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const cod = v.codigo!.trim().toUpperCase();
    if (this.promoSrv.getByCodigo(cod)) {
      alert('El código ya existe. Usa otro.');
      return;
    }
    this.promoSrv.add({
      codigo: v.codigo!.trim().toUpperCase(),
      descuentoPorc: Number(v.descuentoPorc),
      productosIds: v.productosIds ?? [],
      activo: true
    });
    // limpieza del formulario
    this.form.reset({ codigo: '', descuentoPorc: 10, productosIds: [] });
  }

  cambiarEstado(p: Promocion) { this.promoSrv.update(p.id, { activo: !p.activo }); }
  eliminar(p: Promocion) { if (confirm(`Eliminar promoción ${p.codigo}?`)) this.promoSrv.remove(p.id); }

  nombreProducto(id: string, items: Product[]): string {
    return items.find(p => p.id === id)?.name ?? '(eliminado)';
  }
}
