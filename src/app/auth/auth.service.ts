import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
/**
 * Tipo interno que simula la tabla completa de la BD,
 * incluyendo el password solo para este servicio.
 */
type UserWithPassword = User & { passwordHash: string };

/**
 * Servicio de Autenticación (AuthService).
 * Maneja la lógica de login, logout y el estado de la sesión (HDU2).
 * Es un singleton provisto en 'root'.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // --- (BD PROVISORIA) ---
  /**
   * Simulación de la "tabla de usuarios" (BD Provisoria).
   * Basado en experiencia con SQL, usamos un array de objetos
   * en lugar de 'if' anidados para una lógica más limpia.
   * (Requerimiento de HDU2: "registro previamente guardado").
   */
  private userDatabase: UserWithPassword[] = [
    { 
      id: '1', 
      email: 'admin@admin.cl', 
      passwordHash: 'admin123', // En un caso real, esto sería un hash
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
  // --- FIN BD PROVISORIA ---

  /**
   * BehaviorSubject que almacena el estado actual del usuario (null si está desconectado).
   * Es privado para que solo el servicio pueda emitir nuevos valores.
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /**
   * Observable público del estado del usuario.
   * Otros componentes (como el Header) se suscribirán a este
   * para reaccionar a los cambios de sesión (HDU3).
   */
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() { }

  /**
   * Valida las credenciales del usuario contra la BD simulada.
   * (Cumple criterios de HDU2).
   * @param email El email ingresado por el usuario.
   * @param password El password ingresado por el usuario.
   * @returns Un Observable<User | null> - El objeto User si es exitoso, o null si falla.
   */
  login(email: string, password: string): Observable<User | null> {

    // Simula un "SELECT * FROM users WHERE email = ... AND password = ..."
    const userFound = this.userDatabase.find(
      user => user.email === email && user.passwordHash === password
    );

    if (userFound) {
      // Éxito.
      // Desestructura para quitar el passwordHash del objeto de sesión.
      const { passwordHash, ...userSessionData } = userFound;
      
      // Emite el nuevo estado (usuario logueado) a todos los suscriptores.
      this.currentUserSubject.next(userSessionData);
      // Retorna el usuario (usando 'of' para crear un Observable).
      return of(userSessionData);
    } else {
      // Falla (Criterio HDU2: Credenciales incorrectas).
      return of(null);
    }
  }

  /**
   * Cierra la sesión del usuario.
   * (Cumple criterio de HDU3: "botón Cerrar Sesión").
   */
  logout(): void {
    // Emite 'null' para notificar a la app que el usuario cerró sesión.
    this.currentUserSubject.next(null);
  }

  /**
   * Registra un nuevo usuario en la BD simulada.
   * (Cumple criterios de HDU1).
   * @param name El nombre del nuevo usuario.
   * @param email El email del nuevo usuario.
   * @param password El password del nuevo usuario.
   * @returns Un Observable<User> con el usuario creado, o un error si el email ya existe.
   */
  register(name: string, email: string, password: string): Observable<User> {
    // 1. Verificar si el email ya está en uso.
    const userExists = this.userDatabase.find(user => user.email === email);
    if (userExists) {
      // Retorna un observable que emite un error.
      return throwError(() => new Error('El email ya está registrado.'));
    }

    // 2. Crear el nuevo usuario.
    const newUser: UserWithPassword = {
      id: new Date().getTime().toString() + Math.random(), // ID único simple
      name,
      email,
      passwordHash: password, // En un caso real, aquí se haría el hash.
      role: 'Client' // Por defecto, todos los registros son de clientes.
    };

    // 3. Guardar en la "base de datos".
    this.userDatabase.push(newUser);
    return of(newUser); // Retorna el nuevo usuario en un observable.
  }
}