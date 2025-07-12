import React, { useState } from 'react';
import { authService } from './services/authService.js';

function LoginIntegrated({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await authService.login(formData.email, formData.password);
        console.log('Login success:', response);
        setUser(response.user);
        if (onLogin) onLogin(response.user);
      } else {
        // Registro
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organization_id: 'default-org'
        };
        const response = await authService.register(userData);
        console.log('Register success:', response);
        setUser(response.user);
        if (onLogin) onLogin(response.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setFormData({ email: '', password: '', name: '' });
  };

  const quickLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login('admin@boardsync.com', 'password');
      setUser(response.user);
      if (onLogin) onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <h2>✅ Login Realizado com Sucesso!</h2>
          <p><strong>Usuário:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>🎉 <strong>Integração Frontend + Backend funcionando!</strong></p>
          <p>Próximos passos: implementar workspaces e boards</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>BoardSync</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setIsLogin(true)}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: isLogin ? '#007bff' : '#f8f9fa',
            color: isLogin ? 'white' : '#333',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button 
          onClick={() => setIsLogin(false)}
          style={{ 
            padding: '10px 20px',
            backgroundColor: !isLogin ? '#007bff' : '#f8f9fa',
            color: !isLogin ? 'white' : '#333',
            border: '1px solid #007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Registro
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registrar')}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={quickLogin}
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Login Rápido (Admin)
        </button>
      </div>
    </div>
  );
}

export default LoginIntegrated;
