import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly LS_KEY = 'bk_products';
  private _items$ = new BehaviorSubject<Product[]>(this.read());
  items$ = this._items$.asObservable();

  add(p: Omit<Product, 'id'>) {
    const items = [...this._items$.value];
    const id = crypto.randomUUID?.() ?? String(Date.now());
    items.push({ id, ...p });
    this.write(items);
    this._items$.next(items);
  }

  private read(): Product[] {
    const raw = localStorage.getItem(this.LS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
    const seed: Product[] = [
      { id: '1', name: 'Whopper', basePrice: 4290, stock: 15 },
      { id: '2', name: 'King de Pollo', basePrice: 3590, stock: 20 },
    ];
    this.write(seed);
    return seed;
  }
  private write(list: Product[]) { localStorage.setItem(this.LS_KEY, JSON.stringify(list)); }
}
