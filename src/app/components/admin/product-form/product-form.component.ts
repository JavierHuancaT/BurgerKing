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

  categorias: string[] = ['Combos de Carne', 'Combos de Pollo', 'Snacks', 'Postres', 'Bebidas', 'Otros'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    descripcion: ['', [Validators.maxLength(200)]],
    categoria: ['Otros', [Validators.required]]
  });

  editId: string | null = null;
  previewData: string | null = null; // ← Data URL para preview/guardar

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
      if (!p) { this.router.navigate(['/admin/products']); return; }
      this.editId = id;
      this.form.patchValue({
        name: p.name,
        basePrice: p.basePrice,
        stock: p.stock,
        descripcion: p.descripcion,
        categoria: (p.categoria && p.categoria.trim()) ? p.categoria : 'Otros'
      });
      this.previewData = p.imageData ?? null;  // ← muestra imagen existente
    }
  }

  async onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // (opcional) valida tamaño máx ~ 500KB
    const maxBytes = 500 * 1024;
    let blob: Blob = file;

    // (opcional) redimensiona para no reventar localStorage
    if (file.size > maxBytes) {
      blob = await this.resizeImage(file, 512); // 512px de ancho máx
    }

    const dataURL = await this.blobToDataURL(blob);
    this.previewData = dataURL; // listo para guardar
  }

  quitarImagen() {
    this.previewData = null;
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, basePrice, stock, descripcion, categoria } = this.form.value;

    if (this.editId) {
      this.srv.update(this.editId, {
        name: name!, basePrice: Number(basePrice), stock: Number(stock), descripcion: descripcion!,
        categoria: categoria!,
        imageData: this.previewData ?? undefined
      });
    } else {
      this.srv.add({
        name: name!, basePrice: Number(basePrice), stock: Number(stock), descripcion: descripcion!,
        categoria: categoria!,
        imageData: this.previewData ?? undefined
      });
    }
    this.router.navigate(['/admin/products']);
  }

  // Helpers
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  }

  private resizeImage(file: File, maxWidth: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no 2d ctx'));
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.85);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}
