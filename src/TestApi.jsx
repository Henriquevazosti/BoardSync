import React, { useState, useEffect } from 'react';

const TestApi = () => {
  const [status, setStatus] = useState('Testando...');
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testApi();
  }, []);

  const testApi = async () => {
    try {
      console.log('Testando conexão com API...');
      
      // Testar health check
      const healthResponse = await fetch('http://localhost:3001/health');
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);
      
      setStatus('API conectada!');
      setApiData(healthData);
      
    } catch (err) {
      console.error('Erro ao testar API:', err);
      setError(err.message);
      setStatus('Erro na conexão');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste de Integração API</h1>
      <p><strong>Status:</strong> {status}</p>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {apiData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Dados da API:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}
      
      <button onClick={testApi} style={{ marginTop: '20px' }}>
        Testar Novamente
      </button>
    </div>
  );
};

export default TestApi;
