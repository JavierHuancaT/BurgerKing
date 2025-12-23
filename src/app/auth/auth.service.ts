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

  // === CONFIGURACIÓN DE SEGURIDAD ===
  private readonly HASH_KEY = 'mi-clave-secreta-bk-super-segura'; 
  private readonly LS_SESSION_KEY = 'bk_secure_session_v2'; 
  private readonly LS_USERS_DB = 'bk_users_db_v1'; 

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password + this.HASH_KEY).toString();
  }

  // === BASE DE DATOS INICIAL (Default) ===
  private userDatabase: UserWithPassword[] = [
    { 
      id: '1', 
      email: 'admin@admin.cl', 
      passwordHash: this.hashPassword('admin123'), 
      name: 'Admin Burger', 
      role: 'Admin' 
    },
    { 
      id: '2', 
      email: 'cliente@cliente.cl', 
      passwordHash: this.hashPassword('cliente123'), 
      name: 'Cliente Frecuente', 
      role: 'Client' 
    }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router) { 
    // 1. CARGAR USUARIOS (Con migración de seguridad)
    this.loadUserDatabase();

    // 2. VERIFICAR SESIÓN
    this.checkSession();
  }

  // <--- LÓGICA DE CARGA INTELIGENTE (NO BORRA DATOS ANTIGUOS)
  private loadUserDatabase(): void {
    const rawData = localStorage.getItem(this.LS_USERS_DB);
    
    if (rawData) {
      // A. INTENTO DE MIGRACIÓN: ¿Son datos antiguos en texto plano?
      // Si empieza con '[' asumimos que es el array JSON antiguo sin encriptar.
      if (rawData.trim().startsWith('[')) {
        try {
          this.userDatabase = JSON.parse(rawData);
          // ¡Importante! Lo guardamos inmediatamente ENCRIPTADO para protegerlo a futuro
          this.saveUserDatabase(); 
          return;
        } catch (e) {
          // Si falla, no era JSON válido, seguimos...
        }
      }

      // B. INTENTO DE DESENCRIPTADO: ¿Son datos seguros?
      try {
        const bytes = CryptoJS.AES.decrypt(rawData, this.HASH_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        
        if (decryptedData) {
          this.userDatabase = JSON.parse(decryptedData);
        }
      } catch (e) {
        // Si los datos están corruptos, usamos los default y sobreescribimos
        this.saveUserDatabase();
      }
    } else {
      // Si no existe nada, creamos la DB inicial
      this.saveUserDatabase();
    }
  }

  // <--- GUARDAR SIEMPRE ENCRIPTADO (Oculto del ojo humano)
  private saveUserDatabase(): void {
    const jsonDB = JSON.stringify(this.userDatabase);
    const encryptedDB = CryptoJS.AES.encrypt(jsonDB, this.HASH_KEY).toString();
    localStorage.setItem(this.LS_USERS_DB, encryptedDB);
  }

  private checkSession(): void {
    const encryptedData = localStorage.getItem(this.LS_SESSION_KEY);
    
    if (encryptedData) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.HASH_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedData) throw new Error('Datos corruptos');

        const user = JSON.parse(decryptedData);
        this.currentUserSubject.next(user);

      } catch (error) {
        this.logout(); 
      }
    }
  }

  // --- MÉTODOS PÚBLICOS ---
  public getCurrentUser(): User | null { return this.currentUserSubject.value; }
  public isLoggedIn(): boolean { return this.currentUserSubject.value !== null; }
  public isAdmin(): boolean { return this.currentUserSubject.value?.role === 'Admin'; }
  public isClient(): boolean { return this.currentUserSubject.value?.role === 'Client'; }

  // --- LOGIN ---
  login(email: string, password: string): Observable<User | null> {
    const hashedInputPassword = this.hashPassword(password);

    const userFound = this.userDatabase.find(
      user => user.email === email && user.passwordHash === hashedInputPassword
    );

    if (userFound) {
      this.crearSesionSegura(userFound); 
      return of(userFound);
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

  // --- REGISTER (SIN LOGS VISIBLES) ---
  register(name: string, email: string, password: string): Observable<User> {
    
    const userExists = this.userDatabase.find(u => u.email === email);
    if (userExists) {
      return throwError(() => new Error('El correo ya está registrado.'));
    }

    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name: name,
      email: email,
      passwordHash: this.hashPassword(password),
      role: 'Client'
    };

    // Guardamos en memoria
    this.userDatabase.push(newUser);
    
    // Guardamos en disco (ENCRIPTADO, gracias a saveUserDatabase)
    this.saveUserDatabase();

    // Sin auto-login, solo retornamos éxito
    return of({ 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role 
    });
  }

  private crearSesionSegura(user: UserWithPassword): void {
    const { passwordHash, ...userSessionData } = user;
    
    const userSessionDataMasked = { 
      ...userSessionData,
      passwordHash: '••••••••'
    };

    const encryptedSession = CryptoJS.AES.encrypt(
      JSON.stringify(userSessionDataMasked), 
      this.HASH_KEY
    ).toString();

    localStorage.setItem(this.LS_SESSION_KEY, encryptedSession);
    this.currentUserSubject.next(userSessionDataMasked);
  }
}