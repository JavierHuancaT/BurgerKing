import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, map, Subscription, combineLatest } from 'rxjs';
import { ProductService, Product } from 'src/app/services/product.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { PromocionService } from 'src/app/services/promocion.service';

type ProductoVM = {
  id: string;
  nombre: string;
  imagen?: string;
  descripcion?: string;
  precio: number;           // precio base
  categoria: string;
  // Promoción
  precioOferta: number;     // precio que se mostrará/usa en carrito
  descuento: number;        // porcentaje aplicado (0 si no hay)
};

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit, OnDestroy {
  constructor(
    private carritoService: CarritoService,
    private productSrv: ProductService,
    private promoSrv: PromocionService
  ) {}

  categoriaSeleccionada: string | null = null;
  private cantidades = new Map<string, number>();
  private sub?: Subscription;

  // Categorías derivadas SOLO de productos (está bien así)
  categorias$: Observable<string[]> = this.productSrv.items$.pipe(
    map((items: Product[]) => {
      const set = new Set<string>();
      for (const p of items) set.add(this.getCategoria(p));

      const orden = ['Combos de Carne','Combos de Pollo','Bebidas','Snacks','Postres','Otros'];
      const list = Array.from(set);
      list.sort((a,b) => (orden.indexOf(a) > -1 ? orden.indexOf(a) : 999)
                       - (orden.indexOf(b) > -1 ? orden.indexOf(b) : 999)
                       || a.localeCompare(b));
      return list;
    })
  );

  // 🔴 Antes dependía solo de products; ahora depende de products + promos
  productosPorCategoria$: Observable<Record<string, ProductoVM[]>> =
    combineLatest([this.productSrv.items$, this.promoSrv.items$]).pipe(
      map(([items]) => {
        const mapa: Record<string, ProductoVM[]> = {};
        for (const p of items) {
          const cat = this.getCategoria(p);
          const { precioOferta, descuento } =
            this.promoSrv.precioConPromo(p.basePrice, p.id);

          (mapa[cat] ||= []).push({
            id: p.id,
            nombre: p.name,
            imagen: p.imageData,
            descripcion: p.descripcion,
            precio: p.basePrice,
            categoria: cat,
            precioOferta,
            descuento
          });
        }
        Object.values(mapa).forEach(arr => arr.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        return mapa;
      })
    );

  ngOnInit(): void {
    this.sub = this.categorias$.subscribe(cats => {
      if (!cats?.length) { this.categoriaSeleccionada = null; return; }
      if (!this.categoriaSeleccionada || !cats.includes(this.categoriaSeleccionada)) {
        this.categoriaSeleccionada = cats[0];
      }
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // Helpers UI
  seleccionarCategoria(cat: string) { this.categoriaSeleccionada = cat; }
  cantidadDe(id: string): number { return this.cantidades.get(id) ?? 1; }
  cambiarCantidad(id: string, delta: number) {
    const next = Math.max(1, this.cantidadDe(id) + delta);
    this.cantidades.set(id, next);
  }

  agregarAlCarrito(prod: ProductoVM) {
    // Revalida el precio por si cambió la promo justo ahora
    const latest = this.promoSrv.precioConPromo(prod.precio, prod.id);
    this.carritoService.agregarProducto({
      nombre:  prod.nombre,
      imagen:  prod.imagen,
      precio:  latest.precioOferta,
      cantidad: this.cantidadDe(prod.id)
    });
    this.cantidades.set(prod.id, 1);
    this.carritoService.abrirCarrito();
  }

  private getCategoria(p: Product): string {
    return (p.categoria && p.categoria.trim()) ? p.categoria.trim() : 'Otros';
  }
}
