export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  photoUrl?: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  termsAccepted: boolean;
}
