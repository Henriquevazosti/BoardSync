import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

// Hook para gerenciar autenticação
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há usuário logado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getCurrentUser();
          setUser(userData);
          
          // Verificar se o token ainda é válido
          await authService.verifyToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError(error.message);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de registro
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
