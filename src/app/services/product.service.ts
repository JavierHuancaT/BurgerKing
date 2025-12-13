import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

const LS_KEY = 'bk_products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _items$ = new BehaviorSubject<Product[]>(this.read());
  public  items$ = this._items$.asObservable();

  private normalize = (p: any): Product => ({
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    basePrice: Number(p.basePrice ?? 0),
    stock: Number(p.stock ?? 0),
    descripcion: String(p.descripcion ?? ''),
    categoria: String(p.categoria ?? ''),
    imageData: String(p.imageData ?? ''),
    personalizaciones: Array.isArray(p.personalizaciones) ? p.personalizaciones.map((o: any) => ({
      nombre: String(o.nombre ?? ''),
      precio: Number(o.precio ?? 0)
    })) : []
  });

  private read(): Product[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(this.normalize) : [];
    }
    catch { return []; }
  }
  private write(items: Product[]) { localStorage.setItem(LS_KEY, JSON.stringify(items)); }

  add(p: Omit<Product, 'id'>) {
    const items = [...this._items$.value];
    const id = crypto.randomUUID?.() ?? String(Date.now());
    items.push({ id, ...p });
    this.write(items);
    this._items$.next(items);
  }

  findById(id: string): Product | undefined {
    return this._items$.value.find(p => p.id === id);
  }

  update(id: string, changes: Partial<Omit<Product,'id'>>) {
    const items = this._items$.value.map(p => p.id === id ? { ...p, ...changes } : p);
    this.write(items);
    this._items$.next(items);
  }

  remove(id: string) {
    const items = this._items$.value.filter(p => p.id !== id);
    this.write(items);
    this._items$.next(items);
  }
}
