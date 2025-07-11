import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import './Login.css';

const LoginApi = ({ onGoToRegister }) => {
  const { login, authLoading } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      await login(formData.email, formData.password);
      
      // Login bem-sucedido - o contexto vai gerenciar a navegação
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'Erro ao fazer login. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      // Login rápido com usuário admin
      await login('admin@boardsync.com', 'password');
    } catch (error) {
      console.error('Quick login error:', error);
      setErrors({
        general: error.message || 'Erro ao fazer login rápido. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>BoardSync</h1>
          <p>Faça login para acessar seus projetos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="seu@email.com"
              disabled={isLoading || authLoading}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
              disabled={isLoading || authLoading}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || authLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <button 
            type="button" 
            onClick={handleQuickLogin}
            className="quick-login-button"
            disabled={isLoading || authLoading}
          >
            🚀 Login Rápido (Admin)
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta? {' '}
            <button 
              type="button" 
              onClick={onGoToRegister}
              className="link-button"
              disabled={isLoading || authLoading}
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginApi;
