// src/models/User.ts
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'user';
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
}
