import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
// CAMBIO 1: Importamos CryptoJS y Router
import * as CryptoJS from 'crypto-js'; 
import { Router } from '@angular/router';

// CAMBIO 2: Definimos que el usuario tiene un campo de hash
type UserWithPassword = User & { passwordHash: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // CAMBIO 3: Constantes para seguridad
  private readonly HASH_KEY = 'mi-clave-secreta-bk'; 
  private readonly LS_SESSION_KEY = 'currentUser';
  
  // CAMBIO 4: Función auxiliar para encriptar
  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password + this.HASH_KEY).toString();
  }

  // --- (BD PROVISORIA) ---
  private userDatabase: UserWithPassword[] = [
    { 
      id: '1', 
      email: 'admin@admin.cl', 
      // CAMBIO 5: La contraseña inicial ya nace encriptada
      passwordHash: this.hashPassword('admin123'), 
      name: 'Admin Burger', 
      role: 'Admin' 
    },
    { 
      id: '2', 
      email: 'cliente@cliente.cl', 
      // CAMBIO 5: La contraseña inicial ya nace encriptada
      passwordHash: this.hashPassword('cliente123'), 
      name: 'Cliente Frecuente', 
      role: 'Client' 
    }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // CAMBIO 6: Inyectamos el Router en el constructor
  constructor(private router: Router) { 
    const userGuardado = localStorage.getItem(this.LS_SESSION_KEY); // Usamos la constante
    if (userGuardado) {
      this.currentUserSubject.next(JSON.parse(userGuardado));
    }
  }

  // --- MÉTODOS SÍNCRONOS ---
  public getCurrentUser(): User | null { return this.currentUserSubject.value; }
  public isLoggedIn(): boolean { return this.currentUserSubject.value !== null; }
  public isAdmin(): boolean { return this.currentUserSubject.value?.role === 'Admin'; }
  public isClient(): boolean { return this.currentUserSubject.value?.role === 'Client'; }

  // --- LOGIN ---
  login(email: string, password: string): Observable<User | null> {

    // CAMBIO 7: Encriptamos lo que escribió el usuario para comparar
    const hashedInputPassword = this.hashPassword(password);

    const userFound = this.userDatabase.find(
      user => user.email === email && user.passwordHash === hashedInputPassword
    );

    if (userFound) {
      // CAMBIO 8: Lógica de la MÁSCARA
      const { passwordHash, ...userSessionData } = userFound;
      
      // Creamos un objeto nuevo donde el password son puntos
      const userSessionDataMasked = { 
        ...userSessionData,
        passwordHash: '••••••••' // <--- ESTO ES LO QUE SE VE EN EL NAVEGADOR
      };

      localStorage.setItem(this.LS_SESSION_KEY, JSON.stringify(userSessionDataMasked)); 
      this.currentUserSubject.next(userSessionDataMasked);
      
      return of(userSessionDataMasked);
    } else {
      return of(null);
    }
  }

  // --- LOGOUT ---
  logout(): void {
    localStorage.removeItem(this.LS_SESSION_KEY); 
    this.currentUserSubject.next(null);
    // CAMBIO 9: Redirigimos al usuario al login
    this.router.navigate(['/auth/login']);
  }

  // --- REGISTER ---
  register(name: string, email: string, password: string): Observable<User> {
    const userExists = this.userDatabase.find(user => user.email === email);
    if (userExists) {
      return throwError(() => new Error('El email ya está registrado.'));
    }

    // CAMBIO 10: Encriptamos la contraseña ANTES de guardarla
    const hashedPassword = this.hashPassword(password);

    const newUser: UserWithPassword = {
      id: `${new Date().getTime()}-${Math.random()}`, 
      name,
      email,
      passwordHash: hashedPassword, // <--- Guardamos Hash
      role: 'Client'
    };

    this.userDatabase.push(newUser);
    
    // Devolvemos el usuario sin el hash real (para la sesión inmediata, si quisieras auto-login)
    // Nota: Si quieres que el registro haga auto-login con máscara, deberías aplicar la misma lógica que en login.
    // Por ahora devolvemos el usuario limpio.
    const { passwordHash, ...userSessionData } = newUser;
    return of(userSessionData);
  }
}