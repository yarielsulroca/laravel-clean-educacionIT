"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  // Agrega más campos según tu backend
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configuración base de Axios
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token automáticamente
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Interceptor - ${config.method?.toUpperCase()} ${config.url} - Token: ${token.substring(0, 10)}...`); // Debug
    } else {
      console.log(`Interceptor - ${config.method?.toUpperCase()} ${config.url} - Sin token`); // Debug
    }
    return config;
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token en checkAuthStatus:', token); // Debug
      console.log('Tipo del token:', typeof token); // Debug
      
      if (!token || token === 'undefined' || token === 'null') {
        console.log('No hay token válido, saliendo...'); // Debug
        setIsLoading(false);
        return;
      }

      console.log('Haciendo petición a /profile con token:', token); // Debug
      const { data } = await api.get('/profile');
      console.log('Datos del perfil recibidos:', data); // Debug
      setUser(data.data); // ✅ Accedemos a data.data donde está el usuario
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/login', { email, password });
      
      // Tu backend devuelve { message, data: { user, token, token_type } }
      const { data } = response;
      
      localStorage.setItem('authToken', data.data.token);
      setUser(data.data.user);
      return true;
    } catch (error: unknown) {
      const message = (error as AxiosErrorResponse)?.response?.data?.message || 'Error en el login';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/register', userData);
      
      // Tu backend devuelve { message, data: { user, token, token_type } }
      const { data } = response;
      localStorage.setItem('authToken', data.data.token);
      setUser(data.data.user);
      return true;
    } catch (error: unknown) {
      const message = (error as AxiosErrorResponse)?.response?.data?.message || 'Error en el registro';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Logout - Token encontrado:', token); // Debug
      
      if (token && token !== 'undefined' && token !== 'null') {
        console.log('Logout - Haciendo petición al backend'); // Debug
        await api.post('/logout');
        console.log('Logout - Petición exitosa al backend'); // Debug
      } else {
        console.log('Logout - No hay token válido, solo limpiando local'); // Debug
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Si falla la petición al backend, igual limpiamos el estado local
    } finally {
      // Siempre limpiar el estado local, incluso si falla la llamada al backend
      localStorage.removeItem('authToken');
      setUser(null);
      console.log('Logout - Estado local limpiado'); // Debug
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};