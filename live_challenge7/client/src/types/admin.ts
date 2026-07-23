export interface ManagedUser {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
  createdAt: string;
  noteCount: number;
  storageBytes: number;
}
