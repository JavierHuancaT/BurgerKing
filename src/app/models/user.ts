// src/app/shared/models/user.model.ts

// Definimos los roles que usará la aplicación (para HDU3)
export type UserRole = 'Admin' | 'Client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}