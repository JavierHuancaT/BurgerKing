import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  imageData?: string;
}

const LS_KEY = 'bk_products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _items$ = new BehaviorSubject<Product[]>(this.read());
  public  items$ = this._items$.asObservable();

  private read(): Product[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
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
