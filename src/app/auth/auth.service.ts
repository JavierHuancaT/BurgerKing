import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user'; // asegúrate que el path apunte al archivo correcto

type UserWithPassword = User & { passwordHash: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userDatabase: UserWithPassword[] = [
    { 
      id: '1', 
      email: 'admin@admin.cl', 
      passwordHash: 'admin123',
      name: 'Admin Burger', 
      role: 'Admin' 
    },
    { 
      id: '2', 
      email: 'cliente@cliente.cl', 
      passwordHash: 'cliente123',
      name: 'Cliente Frecuente', 
      role: 'Client' 
    }
  ];

  // clave para localStorage (opcional)
  private readonly STORAGE_KEY = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() { 
    // (Opcional) recuperar sesión almacenada
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        this.currentUserSubject.next(user);
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  // ✅ Getter síncrono para el guard
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ Helpers de estado (HDU3)
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'Admin';
  }

  isClient(): boolean {
    return this.getCurrentUser()?.role === 'Client';
  }

  login(email: string, password: string): Observable<User | null> {
    const userFound = this.userDatabase.find(
      user => user.email === email && user.passwordHash === password
    );

    if (userFound) {
      const { passwordHash, ...userSessionData } = userFound;
      
      this.currentUserSubject.next(userSessionData);

      // (Opcional) persistir sesión
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userSessionData));

      return of(userSessionData);
    } else {
      return of(null);
    }
  }

  logout(): void {
    // Emite null
    this.currentUserSubject.next(null);
    // Limpia almacenamiento
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
