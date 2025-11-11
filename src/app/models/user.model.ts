export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  username: string;
  role: UserRole;
  token: string;
}
