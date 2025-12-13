import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

// Esta es la "clave" con la que se guardarán los datos en el navegador
const LS_KEY = 'bk_products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  
  // 1. INICIALIZACIÓN:
  // Al arrancar, llamamos a "read()" para recuperar lo guardado antes.
  private _items$ = new BehaviorSubject<Product[]>(this.read());
  public  items$ = this._items$.asObservable();

  constructor() {
    // Debug: Esto te mostrará en la consola del navegador cuántos productos se recuperaron al iniciar.
    console.log('Servicio iniciado. Productos recuperados:', this._items$.value.length);
  }

  // --- LECTURA (Carga de datos) ---
  private read(): Product[] {
    try {
      // Busamos en la "caja fuerte" del navegador
      const raw = localStorage.getItem(LS_KEY);
      
      // Si no hay nada guardado, devolvemos lista vacía [] (tal como pediste al principio)
      if (!raw) return [];

      const arr = JSON.parse(raw);
      // Aseguramos que lo que recuperamos sea un array válido
      return Array.isArray(arr) ? arr : [];
    }
    catch (error) {
      console.error('Error leyendo localStorage', error);
      return [];
    }
  }

  // --- ESCRITURA (Guardado de datos) ---
  private write(items: Product[]) {
    try {
      // Convertimos el array a texto y lo guardamos en el navegador
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error guardando en localStorage', error);
    }
  }

  // --- MÉTODOS PÚBLICOS (Lo que usa tu Admin) ---

  // AGREGAR
  add(p: Omit<Product, 'id'>) {
    // 1. Obtenemos los items actuales
    const currentItems = this._items$.value;
    
    // 2. Creamos el nuevo producto con ID único
    const newProduct: Product = { 
      id: crypto.randomUUID?.() ?? String(Date.now()), // Generador de ID robusto
      ...p 
    };
    
    // 3. Lo agregamos a la lista
    const updatedItems = [...currentItems, newProduct];
    
    // 4. ¡IMPORTANTE! Guardamos en LocalStorage y actualizamos la app
    this.write(updatedItems);     // <--- Esto asegura que sobreviva al F5
    this._items$.next(updatedItems); // <--- Esto actualiza la vista en tiempo real
  }

  // EDITAR
  update(id: string, changes: Partial<Omit<Product, 'id'>>) {
    const currentItems = this._items$.value;
    
    const updatedItems = currentItems.map(p => 
      p.id === id ? { ...p, ...changes } : p
    );
    
    this.write(updatedItems);      // <--- Guardamos cambios
    this._items$.next(updatedItems);
  }

  // ELIMINAR
  remove(id: string) {
    const currentItems = this._items$.value;
    
    const updatedItems = currentItems.filter(p => p.id !== id);
    
    this.write(updatedItems);      // <--- Guardamos cambios
    this._items$.next(updatedItems);
  }

  // BUSCAR POR ID
  findById(id: string): Product | undefined {
    return this._items$.value.find(p => p.id === id);
  }
}
