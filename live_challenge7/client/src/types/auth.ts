export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export type AuthStatus =
  | 'checking'
  | 'anonymous'
  | 'guest'
  | 'authenticated'
  | 'failed';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}
