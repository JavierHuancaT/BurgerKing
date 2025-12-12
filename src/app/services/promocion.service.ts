import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Promocion } from '../models/promocion.module';

const LS_KEY = 'bk_promociones';

@Injectable({ providedIn: 'root' })
export class PromocionService {
  private _items$ = new BehaviorSubject<Promocion[]>(this.read());
  items$ = this._items$.asObservable();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === LS_KEY) this.refreshFromLocalStorage();
    });
  }

  // ======= Persistencia =======
  private read(): Promocion[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(this.normalize) : [];
    } catch {
      return [];
    }
  }

  private write(items: Promocion[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  private refreshFromLocalStorage() {
    this._items$.next(this.read());
  }

  // Acepta objetos guardados con nombres antiguos y los normaliza a tu modelo actual
  private normalize = (p: any): Promocion => ({
    id: String(p.id),
    codigo: (p.codigo ?? '').toString().toUpperCase(),
    descuentoPorc: Number(p.descuentoPorc ?? p.porcentaje ?? 0),
    productosIds: Array.isArray(p.productosIds)
      ? p.productosIds.map(String)
      : Array.isArray(p.productos)
        ? p.productos.map(String)
        : [],
    activo: Boolean(p.activo)
  });

  // ======= CRUD =======
  add(p: Omit<Promocion, 'id'>) {
    const id = (crypto as any)?.randomUUID?.() ?? String(Date.now());
    const nuevo = this.normalize({ id, ...p });
    const next = [...this._items$.value, nuevo];
    this.write(next);
    this._items$.next(next);
  }

  update(id: string, changes: Partial<Omit<Promocion, 'id'>>) {
    const norm = this.normalize({ id, ...changes });
    const next = this._items$.value.map(x => x.id === id ? { ...x, ...norm } : x);
    this.write(next);
    this._items$.next(next);
  }

  remove(id: string) {
    const next = this._items$.value.filter(x => x.id !== id);
    this.write(next);
    this._items$.next(next);
  }

  getByCodigo(codigo: string) {
    const cod = (codigo ?? '').trim().toUpperCase();
    return this._items$.value.find(p => p.codigo === cod) ?? null;
  }

  // ======= Conexión con catálogo/carrito =======

  /** Devuelve el % de descuento más alto aplicable al producto. */
  getDescuentoProducto(productId: string): number {
    const pid = String(productId);
    let max = 0;
    for (const p of this._items$.value) {
      if (!p.activo) continue;
      if (p.productosIds?.includes(pid)) {
        const d = Number(p.descuentoPorc || 0);
        if (!Number.isNaN(d)) max = Math.max(max, d);
      }
    }
    return max;
  }

  /** Calcula precio final + % aplicado para un producto. */
  precioConPromo(basePrice: number, productId: string): { precioOferta: number; descuento: number } {
    const descuento = this.getDescuentoProducto(productId);
    if (!descuento || descuento <= 0) {
      return { precioOferta: basePrice, descuento: 0 };
    }
    const precioOferta = Math.max(0, Math.round(basePrice * (1 - descuento / 100)));
    return { precioOferta, descuento };
  }
}
