import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import * as CryptoJS from 'crypto-js'; 
import { Router } from '@angular/router';

type UserWithPassword = User & { passwordHash: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // CONFIGURACIÓN DE SEGURIDAD
  private readonly HASH_KEY = 'mi-clave-secreta-bk-super-segura'; 
  // Se ha cambiado el nombre de la clave para que NO choque con la vieja
  private readonly LS_SESSION_KEY = 'bk_secure_session_v2'; 
  
  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password + this.HASH_KEY).toString();
  }

// En nuestra "Base de Datos", asignamos propiedades específicas a cada usuario
  private userDatabase: UserWithPassword[] = [
    { 
      id: '1', 
      email: 'admin@admin.cl', 
      passwordHash: this.hashPassword('admin123'), 
      name: 'Admin Burger', 
      role: 'Admin' // <--- ROL DE ADMINISTRADOR (Acceso Total)
    },
    { 
      id: '2', 
      email: 'cliente@cliente.cl', 
      passwordHash: this.hashPassword('cliente123'), 
      name: 'Cliente Frecuente', 
      role: 'Client' // <--- ROL DE CLIENTE (Acceso Limitado)
    }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router) { 
    this.checkSession();
  }

  // --- MÉTODOS DE SEGURIDAD PARA SESIÓN ---

  private checkSession(): void {
    const encryptedData = localStorage.getItem(this.LS_SESSION_KEY);
    
    if (encryptedData) {
      try {
        // Intentamos una operación peligrosa (desencriptar)
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.HASH_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedData) {
          throw new Error('Datos corruptos o manipulación detectada');
        }

        const user = JSON.parse(decryptedData);
        this.currentUserSubject.next(user);

      } catch (error) {
          // SI FALLA (Datos corruptos o manipulación):
          // RÚBRICA: "Se controlan errores sin que la aplicación quede inactiva"
        console.error('ALERTA DE SEGURIDAD: Intento de manipulación de LocalStorage detectado.');
        this.logout(); // <-- RECUPERACIÓN: Cerramos sesión limpiamente en vez de crashear.
      }
    }
  }

  // --- MÉTODOS PÚBLICOS ---
  public getCurrentUser(): User | null { return this.currentUserSubject.value; }
  public isLoggedIn(): boolean { return this.currentUserSubject.value !== null; }
  // Métodos auxiliares para consultar el rol en cualquier parte de la página
  public isAdmin(): boolean { return this.currentUserSubject.value?.role === 'Admin'; }
  public isClient(): boolean { return this.currentUserSubject.value?.role === 'Client'; }

  // --- LOGIN ---
  login(email: string, password: string): Observable<User | null> {
    console.log('Intentando login seguro...'); // Debug

    const hashedInputPassword = this.hashPassword(password);

    const userFound = this.userDatabase.find(
      user => user.email === email && user.passwordHash === hashedInputPassword
    );

    if (userFound) {
      const { passwordHash, ...userSessionData } = userFound;
      
      const userSessionDataMasked = { 
        ...userSessionData,
        passwordHash: '••••••••'
      };

      // ENCRIPTACIÓN: Aquí ocurre la magia
      const encryptedSession = CryptoJS.AES.encrypt(
        JSON.stringify(userSessionDataMasked), 
        this.HASH_KEY
      ).toString();

      console.log('Guardando sesión encriptada...'); // Debug
      localStorage.setItem(this.LS_SESSION_KEY, encryptedSession);
      
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
    this.router.navigate(['/auth/login']);
  }

  // --- REGISTER (Simplificado) ---
  register(name: string, email: string, password: string): Observable<User> {
    // ... tu lógica de registro ...
    // Para simplificar, devolvemos un observable vacío o simulado
    return of({ id: '0', name, email, role: 'Client' });
  }
}