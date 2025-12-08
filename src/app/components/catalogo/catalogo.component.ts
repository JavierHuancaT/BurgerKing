import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, map, Subscription } from 'rxjs';
import { ProductService, Product } from 'src/app/services/product.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

type ProductoVM = {
  id: string;
  nombre: string;
  imagen?: string;
  descripcion?: string;
  precio: number;
  categoria: string;
};

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit, OnDestroy {
  constructor(
    private carritoService: CarritoService,
    private productSrv: ProductService
  ) {}

  // Orden deseado de categorías
  private ordenCategorias = [
    'Combos de Carne',
    'Combos de Pollo',
    'Bebidas',
    'Snacks',
    'Postres'
  ];
  private idxCat = (cat: string) => {
    const i = this.ordenCategorias.indexOf(cat);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  // Estado de selección en la UI
  categoriaSeleccionada: string | null = null;

  // Cantidades elegidas por el usuario (id → cantidad)
  private cantidades = new Map<string, number>();

  // Categorías derivadas de los productos (ordenadas según preferencia)
  categorias$: Observable<string[]> = this.productSrv.items$.pipe(
    map((items: Product[]) => {
      const set = new Set<string>();
      for (const p of items) set.add(this.getCategoria(p));
      return Array.from(set).sort((a, b) => {
        const ia = this.idxCat(a), ib = this.idxCat(b);
        return ia === ib ? a.localeCompare(b) : ia - ib;
      });
    })
  );

  // Mapa {categoria: ProductoVM[]} para render
  productosPorCategoria$: Observable<Record<string, ProductoVM[]>> = this.productSrv.items$.pipe(
    map((items: Product[]) => {
      const mapa: Record<string, ProductoVM[]> = {};
      for (const p of items) {
        const cat = this.getCategoria(p);
        (mapa[cat] ||= []).push({
          id: p.id,
          nombre: p.name,
          imagen: p.imageData,
          // compatibilidad: usa 'descripcion' si existe, si no 'description'
          descripcion: (p as any).descripcion ?? (p as any).description,
          precio: p.basePrice,
          categoria: cat
        });
      }
      // orden simple por nombre dentro de cada categoría
      Object.values(mapa).forEach(arr => arr.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return mapa;
    })
  );

  private sub?: Subscription;

  ngOnInit(): void {
    // Selecciona la primera categoría disponible según el orden preferido
    this.sub = this.categorias$.subscribe(cats => {
      if (!cats?.length) {
        this.categoriaSeleccionada = null;
        return;
      }
      if (!this.categoriaSeleccionada || !cats.includes(this.categoriaSeleccionada)) {
        this.categoriaSeleccionada = cats[0]; // ya viene ordenado
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // Helpers de UI
  seleccionarCategoria(cat: string) { this.categoriaSeleccionada = cat; }
  cantidadDe(id: string): number { return this.cantidades.get(id) ?? 1; }
  cambiarCantidad(id: string, delta: number) {
    const next = Math.max(1, this.cantidadDe(id) + delta);
    this.cantidades.set(id, next);
  }

  agregarAlCarrito(prod: ProductoVM) {
    this.carritoService.agregarProducto({
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio: prod.precio,
      cantidad: this.cantidadDe(prod.id)
    });
    // Resetea cantidad del item a 1
    this.cantidades.set(prod.id, 1);
    this.carritoService.abrirCarrito();
  }

  private getCategoria(p: Product): string {
    // compatibilidad: usa 'categoria' si existe, si no 'category'
    const cat = (p as any).categoria ?? (p as any).category;
    return (typeof cat === 'string' && cat.trim()) ? cat.trim() : 'Otros';
  }
}
