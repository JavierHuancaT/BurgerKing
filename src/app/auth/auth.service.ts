import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Este 'BehaviorSubject' es clave. Almacena al usuario actual
  // y permite que otros componentes (como el Header) escuchen los cambios.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() { }

  /**
   * (HDU2) Simula el login contra la BD provisoria.
   */
  login(email: string, password: string): Observable<User | null> {

    // --- BASE DE DATOS PROVISORIA ---
    if (email === 'admin@admin.cl' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@admin.cl',
        name: 'Admin Burger',
        role: 'Admin'
      };
      
      // Notifica a toda la app que el Admin se logueó
      this.currentUserSubject.next(adminUser);
      return of(adminUser); // Devuelve el usuario
    }

    if (email === 'cliente@cliente.cl' && password === 'cliente123') {
      const clientUser: User = {
        id: '2',
        email: 'cliente@cliente.cl',
        name: 'Cliente Frecuente',
        role: 'Client'
      };
      
      // Notifica a toda la app que el Cliente se logueó
      this.currentUserSubject.next(clientUser);
      return of(clientUser);
    }
    // --- FIN BD PROVISORIA ---

    // (Criterio HDU2: Credenciales incorrectas)
    return of(null);
  }

  // (Criterio HDU3: Botón "Cerrar Sesión")
  logout(): void {
    // Notifica a la app que no hay nadie logueado
    this.currentUserSubject.next(null);
  }
}