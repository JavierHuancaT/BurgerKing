/**
 * Define los roles de usuario permitidos en la aplicación.

 */
export type UserRole = 'Admin' | 'Client';

/**
 * Interface que representa el modelo de datos del Usuario en sesión.
 * Basado en BD, este es el "ViewModel" o "DTO"
 * que la aplicación usará.
 *
 * (No incluye 'password' por seguridad).
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}