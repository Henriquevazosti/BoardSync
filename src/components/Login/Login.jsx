import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onGoToRegister }) => {
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

    setIsLoading(true);

    // Simula uma chamada de API
    setTimeout(() => {
      // Aqui você faria a validação real com backend
      // Por enquanto, vamos simular um login básico
      const validUsers = [
        { email: 'admin@boardsync.com', password: '123456' },
        { email: 'user@boardsync.com', password: '123456' },
        { email: 'demo@boardsync.com', password: 'demo123' }
      ];

      const user = validUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        onLogin({
          id: 'user-' + Date.now(),
          email: user.email,
          name: user.email.split('@')[0],
          isAuthenticated: true
        });
      } else {
        setErrors({ general: 'Email ou senha incorretos' });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">📋</span>
            <h1>BoardSync</h1>
          </div>
          <p className="subtitle">Faça login para acessar seu quadro Kanban</p>
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
              placeholder="seu@email.com"
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Sua senha"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem uma conta?</p>
          <button 
            type="button"
            className="register-link"
            onClick={onGoToRegister}
            disabled={isLoading}
          >
            Criar cadastro
          </button>
        </div>

        <div className="demo-info">
          <h4>Contas de demonstração:</h4>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Admin:</strong> admin@boardsync.com / 123456
            </div>
            <div className="demo-account">
              <strong>Usuário:</strong> user@boardsync.com / 123456
            </div>
            <div className="demo-account">
              <strong>Demo:</strong> demo@boardsync.com / demo123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
