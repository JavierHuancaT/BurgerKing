import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Ingrediente } from '../models/ingrediente';


const LS_KEY = 'bk_ingredientes';

@Injectable({ providedIn: 'root' })
export class IngredienteService {
  private _items$ = new BehaviorSubject<Ingrediente[]>(this.read());
  items$ = this._items$.asObservable();

  private read(): Ingrediente[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  }
  private write(items: Ingrediente[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  add(i: Omit<Ingrediente,'id'>) {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const next = [...this._items$.value, { id, ...i }];
    this.write(next); this._items$.next(next);
  }

  setCantidad(id: string, cantidad: number) {
    const next = this._items$.value.map(x => x.id === id ? { ...x, cantidad } : x);
    this.write(next); this._items$.next(next);
  }

  update(id: string, changes: Partial<Omit<Ingrediente,'id'>>) {
    const next = this._items$.value.map(x => x.id === id ? { ...x, ...changes } : x);
    this.write(next); this._items$.next(next);
  }

  remove(id: string) {
    const next = this._items$.value.filter(x => x.id !== id);
    this.write(next); this._items$.next(next);
  }
}
