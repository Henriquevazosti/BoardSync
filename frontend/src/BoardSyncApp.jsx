import React, { useState, useEffect } from 'react';
import { authService } from './services/authService.js';
import { workspaceService } from './services/workspaceService.js';
import LoginIntegrated from './LoginIntegrated.jsx';

function BoardSyncApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // Carregar workspaces quando usuário faz login
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getCurrentUser();
        
        // Verificar se token é válido
        await authService.verifyToken();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      setWorkspacesLoading(true);
      const response = await workspaceService.getWorkspaces();
      setWorkspaces(response.workspaces || []);
      
      // Selecionar primeiro workspace se existir
      if (response.workspaces?.length > 0) {
        setCurrentWorkspace(response.workspaces[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError('Erro ao carregar workspaces');
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const createWorkspace = async (workspaceData) => {
    try {
      setWorkspacesLoading(true);
      const response = await workspaceService.createWorkspace(workspaceData);
      const newWorkspace = response.workspace;
      
      setWorkspaces(prev => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      
      return newWorkspace;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError('Erro ao criar workspace');
      throw error;
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setError('');
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Carregando BoardSync...</h2>
      </div>
    );
  }

  if (!user) {
    return <LoginIntegrated onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>BoardSync</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Bem-vindo, {user.name}!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </header>

      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Workspaces Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>Workspaces</h2>
          <button 
            onClick={() => {
              const name = prompt('Nome do workspace:');
              if (name) {
                createWorkspace({ 
                  name, 
                  description: 'Workspace criado via interface'
                });
              }
            }}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Novo Workspace
          </button>
        </div>

        {workspacesLoading ? (
          <p>Carregando workspaces...</p>
        ) : workspaces.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <h3>Nenhum workspace encontrado</h3>
            <p>Crie seu primeiro workspace para começar!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {workspaces.map(workspace => (
              <div 
                key={workspace.id}
                style={{ 
                  padding: '20px',
                  border: `2px solid ${currentWorkspace?.id === workspace.id ? '#007bff' : '#dee2e6'}`,
                  borderRadius: '8px',
                  background: currentWorkspace?.id === workspace.id ? '#f8f9ff' : 'white',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentWorkspace(workspace)}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{workspace.name}</h3>
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                  {workspace.description || 'Sem descrição'}
                </p>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Criado em: {new Date(workspace.created_at).toLocaleDateString()}
                </div>
                {currentWorkspace?.id === workspace.id && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '5px 10px', 
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    ✓ Workspace Ativo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Workspace Details */}
      {currentWorkspace && (
        <div style={{ 
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3>Workspace Atual: {currentWorkspace.name}</h3>
          <p>{currentWorkspace.description}</p>
          
          <div style={{ marginTop: '20px' }}>
            <h4>🚧 Em Desenvolvimento</h4>
            <ul style={{ color: '#666' }}>
              <li>✅ Autenticação funcionando</li>
              <li>✅ Workspaces funcionando</li>
              <li>🔲 Boards (próximo passo)</li>
              <li>🔲 Listas e Cards</li>
              <li>🔲 Interface completa do Kanban</li>
            </ul>
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        background: '#d4edda',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#155724' }}>🎉 Status da Integração</h3>
        <div style={{ color: '#155724' }}>
          <p>✅ <strong>Frontend:</strong> React + Vite funcionando</p>
          <p>✅ <strong>Backend:</strong> Node.js + Express + SQLite funcionando</p>
          <p>✅ <strong>Autenticação:</strong> JWT implementado</p>
          <p>✅ <strong>Workspaces:</strong> CRUD completo</p>
          <p>🔲 <strong>Boards:</strong> Pendente (endpoint com erro 500)</p>
        </div>
      </div>
    </div>
  );
}

export default BoardSyncApp;
