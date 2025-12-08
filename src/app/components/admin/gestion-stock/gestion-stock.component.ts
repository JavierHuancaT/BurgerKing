import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IngredienteService } from '../../../services/ingrediente.service';
import { Observable } from 'rxjs';
import { Ingrediente } from 'src/app/models/ingrediente';


@Component({
  selector: 'app-gestion-stock',
  templateUrl: './gestion-stock.component.html',
  styleUrls: ['./gestion-stock.component.css']
})
export class GestionStockComponent {
  ingredientes$: Observable<Ingrediente[]> = this.ingSrv.items$;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(40)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    unidad: ['und'] // por defecto
  });

  constructor(private fb: FormBuilder, private ingSrv: IngredienteService) {}

  agregar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.ingSrv.add({
      nombre: v.nombre!.trim(),
      cantidad: Number(v.cantidad),
      unidad: v.unidad ?? 'und'
    });
    this.form.reset({ nombre: '', cantidad: 0, unidad: 'und' });
  }

  setCantidad(i: Ingrediente, valor: number) {
    this.ingSrv.setCantidad(i.id, Math.max(0, Math.floor(valor)));
  }
  sumar(i: Ingrediente, delta: number) {
    this.ingSrv.setCantidad(i.id, Math.max(0, i.cantidad + delta));
  }
  eliminar(i: Ingrediente) {
    if (confirm(`Eliminar ingrediente "${i.nombre}"?`)) this.ingSrv.remove(i.id);
  }
}
