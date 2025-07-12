import React from 'react';

function SimpleApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>BoardSync - Teste Básico</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Botão funcionando!')}>
          Testar Interação
        </button>
      </div>
      
      <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px' }}>
        <h3>Status do Sistema:</h3>
        <ul>
          <li>✅ React carregado</li>
          <li>✅ Componente renderizado</li>
          <li>✅ Interações funcionando</li>
        </ul>
      </div>
    </div>
  );
}

export default SimpleApp;
