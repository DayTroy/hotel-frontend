export enum UserRole {
  MANAGER = 'MANAGER',
  PORTER = 'PORTER',
  MAID = 'MAID',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
} 