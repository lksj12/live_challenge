export type UserRole = 'admin' | 'user';

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'disabled';
  mustChangePassword: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface AuthContext {
  sessionId: string;
  user: PublicUser;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}
