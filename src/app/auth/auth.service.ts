import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user'; // asegúrate que el path apunte al archivo correcto

type UserWithPassword = User & { passwordHash: string };

/**
 * Servicio de Autenticación (AuthService).
 * Maneja la lógica de login, logout, registro y el estado de la sesión.
 * Es un singleton provisto en 'root' para estar disponible en toda la aplicación.
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
   * Retorna el valor actual del usuario logueado.
   * Es un método de conveniencia para no tener que suscribirse al observable.
   * @returns El objeto User si está logueado, o null si no lo está.
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si hay un usuario logueado.
   * @returns `true` si hay un usuario, `false` en caso contrario.
   */
  public isLoggedIn(): boolean {
    // Si `value` no es `null`, significa que hay un usuario.
    return this.currentUserSubject.value !== null;
  }

  /**
   * Verifica si el usuario logueado tiene el rol de 'Admin'.
   * @returns `true` si el usuario es Admin, `false` en caso contrario.
   */
  public isAdmin(): boolean {
    // Primero, asegúrate que hay un usuario, luego revisa el rol.
    return this.currentUserSubject.value?.role === 'Admin';
  }

  /**
   * Verifica si el usuario logueado tiene el rol de 'Client'.
   * @returns `true` si el usuario es Client, `false` en caso contrario.
   */
  public isClient(): boolean {
    return this.currentUserSubject.value?.role === 'Client';
  }

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
   * Registra un nuevo usuario en la base de datos simulada.
   * @param name El nombre del nuevo usuario.
   * @param email El email del nuevo usuario.
   * @param password El password del nuevo usuario.
   * @returns Un Observable<User> con el usuario creado, o un error si el email ya existe.
   */
  register(name: string, email: string, password: string): Observable<User> {
    // 1. Verificar si el email ya está en uso para evitar duplicados.
    const userExists = this.userDatabase.find(user => user.email === email);
    if (userExists) {
      // Si el usuario ya existe, retorna un observable que emite un error.
      return throwError(() => new Error('El email ya está registrado.'));
    }

    // 2. Si no existe, crear el nuevo objeto de usuario.
    const newUser: UserWithPassword = {
      id: `${new Date().getTime()}-${Math.random()}`, // ID único simple
      name,
      email,
      passwordHash: password, // En un caso real, aquí se haría el hash.
      role: 'Client' // Por defecto, todos los registros son de clientes.
    };

    // 3. Añadir el nuevo usuario a nuestra "base de datos".
    this.userDatabase.push(newUser);
    const { passwordHash, ...userSessionData } = newUser;
    return of(userSessionData); // Retorna el nuevo usuario (sin el hash) en un observable.
  }
}
