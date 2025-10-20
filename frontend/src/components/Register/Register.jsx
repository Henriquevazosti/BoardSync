import React, { useState } from 'react';
import './Register.css';
import { authService } from '../../services/authService.js';

const Register = ({ onRegister, onGoToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Tentando registrar usuário:', formData.email);
      
      // Preparar dados para envio à API
      const registerData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.toLowerCase(),
        password: formData.password
      };
      
      // Usar o authService para fazer registro real na API
      const response = await authService.register(registerData);
      
      console.log('✅ Registro bem-sucedido:', response);
      
      // Chamar a função onRegister do App.jsx com os dados do usuário
      onRegister({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role || 'member',
        isAuthenticated: true,
        token: response.token
      });
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      
      // Tratar diferentes tipos de erro
      if (error.message.includes('já existe') || error.message.includes('already exists')) {
        setErrors({ email: 'Este email já está em uso' });
      } else {
        setErrors({ 
          general: error.message || 'Erro ao criar conta. Tente novamente.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onGoToLogin();
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo">
            <span className="logo-icon">📋</span>
            <h1>BoardSync</h1>
          </div>
          <p className="subtitle">Cadastro de Usuário</p>
          <p className="description">Crie sua conta para acessar o quadro Kanban</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          <div className="name-row">
            <div className="form-group half-width">
              <label htmlFor="firstName">Nome *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Seu nome"
                className={errors.firstName ? 'error' : ''}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group half-width">
              <label htmlFor="lastName">Sobrenome *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Seu sobrenome"
                className={errors.lastName ? 'error' : ''}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Digite a senha novamente"
              className={errors.confirmPassword ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className="create-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Criando usuário...
                </>
              ) : (
                'Criar Usuário'
              )}
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p>Já tem uma conta?</p>
          <button 
            type="button"
            className="login-link"
            onClick={onGoToLogin}
            disabled={isLoading}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
