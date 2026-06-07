export type UserRole = 'executive' | 'operator';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  login_id: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  executive: '경영진',
  operator: '실무진',
};
