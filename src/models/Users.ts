

export interface User {
    id: string;
    username: string;
    email:string;
    password_hash: string;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRequest {
    username : string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: Date;
}