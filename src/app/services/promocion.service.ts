import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Promocion } from '../models/promocion.module';

const LS_KEY = 'bk_promociones';

@Injectable({ providedIn: 'root' })
export class PromocionService {
  private _items$ = new BehaviorSubject<Promocion[]>(this.read());
  items$ = this._items$.asObservable();

  private read(): Promocion[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  }
  private write(items: Promocion[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  add(p: Omit<Promocion,'id'>) {
    const id = (crypto as any)?.randomUUID?.() ?? String(Date.now());
    const next = [...this._items$.value, { id, ...p }];
    this.write(next); this._items$.next(next);
  }

  update(id: string, changes: Partial<Omit<Promocion,'id'>>) {
    const next = this._items$.value.map(x => x.id === id ? { ...x, ...changes } : x);
    this.write(next); this._items$.next(next);
  }

  remove(id: string) {
    const next = this._items$.value.filter(x => x.id !== id);
    this.write(next); this._items$.next(next);
  }
}
