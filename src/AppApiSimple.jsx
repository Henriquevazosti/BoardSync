import React, { useState } from 'react';
import { authService } from './services/authService.js';

function AppApiSimple() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult('Testando...');
    
    try {
      // Testar health check primeiro
      const healthResponse = await fetch('http://localhost:3001/health');
      if (!healthResponse.ok) {
        throw new Error('Health check failed');
      }
      const healthData = await healthResponse.json();
      console.log('Health check OK:', healthData);
      
      // Testar registro de usuário
      const testUser = {
        name: 'Teste User',
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        organization_id: 'default-org'
      };
      
      const registerResponse = await authService.register(testUser);
      console.log('Register response:', registerResponse);
      
      setTestResult(`✅ Sucesso! Usuário criado: ${registerResponse.user.name}`);
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>BoardSync - Teste API</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testApiConnection} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testando...' : 'Testar Conexão API'}
        </button>
      </div>
      
      {testResult && (
        <div style={{ 
          padding: '10px', 
          background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: testResult.includes('✅') ? '#155724' : '#721c24'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Status do Sistema:</strong></p>
        <ul>
          <li>Frontend: http://localhost:3000</li>
          <li>Backend: http://localhost:3001</li>
          <li>Banco: SQLite</li>
        </ul>
      </div>
    </div>
  );
}

export default AppApiSimple;
