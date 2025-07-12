/**
 * Script de verificação rápida da API BoardSync
 * Execute: node quick-api-test.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/v1';
const TEST_USER = {
  email: 'henrique.vazosti@gmail.com',
  password: '123456'
};

async function makeRequest(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function quickTest() {
  console.log('🔍 TESTE RÁPIDO DA API BOARDSYNC');
  console.log('=====================================');
  
  try {
    // 1. Testar conexão
    console.log('🌐 Testando conexão com a API...');
    const healthCheck = await makeRequest('POST', '/auth/login', TEST_USER);
    if (!healthCheck.ok) {
      console.log('❌ API não está respondendo. Certifique-se de que o servidor está rodando.');
      console.log('💡 Execute: node src/server.js');
      return;
    }
    console.log('✅ Conexão OK');

    // 2. Testar login
    console.log('\n🔐 Testando login...');
    const loginResult = await makeRequest('POST', '/auth/login', TEST_USER);
    if (!loginResult.ok) {
      console.log('❌ Falha no login:', loginResult.data?.error || 'Erro desconhecido');
      return;
    }
    console.log('✅ Login OK');
    const token = loginResult.data.token;

    // 3. Testar workspaces
    console.log('\n🏢 Testando workspaces...');
    const workspacesResult = await makeRequest('GET', '/workspaces', null, token);
    if (!workspacesResult.ok) {
      console.log('❌ Falha ao listar workspaces:', workspacesResult.data?.error);
      return;
    }
    console.log(`✅ Workspaces OK (${workspacesResult.data.workspaces?.length || 0} encontrados)`);

    // 4. Testar boards (se tiver workspace válido)
    const validWorkspace = workspacesResult.data.workspaces?.find(ws => 
      ws.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    );

    if (validWorkspace) {
      console.log('\n📋 Testando boards...');
      const boardsResult = await makeRequest('GET', `/boards/workspace/${validWorkspace.id}`, null, token);
      if (!boardsResult.ok) {
        console.log('❌ Falha ao listar boards:', boardsResult.data?.error);
        return;
      }
      console.log(`✅ Boards OK (${boardsResult.data.boards?.length || 0} encontrados)`);

      // 5. Testar listas (se tiver board)
      if (boardsResult.data.boards?.length > 0) {
        const boardId = boardsResult.data.boards[0].id;
        console.log('\n📝 Testando listas...');
        const listsResult = await makeRequest('GET', `/lists/board/${boardId}`, null, token);
        if (!listsResult.ok) {
          console.log('❌ Falha ao listar listas:', listsResult.data?.error);
          return;
        }
        console.log(`✅ Listas OK (${listsResult.data.lists?.length || 0} encontradas)`);

        // 6. Testar labels
        console.log('\n🏷️ Testando labels...');
        const labelsResult = await makeRequest('GET', `/labels/board/${boardId}`, null, token);
        if (!labelsResult.ok) {
          console.log('❌ Falha ao listar labels:', labelsResult.data?.error);
          return;
        }
        console.log(`✅ Labels OK (${labelsResult.data.labels?.length || 0} encontradas)`);
      }
    }

    console.log('\n🎉 RESULTADO FINAL');
    console.log('==================');
    console.log('✅ API está funcionando corretamente!');
    console.log('✅ Autenticação operacional');
    console.log('✅ Endpoints principais testados');
    console.log('✅ Banco de dados acessível');
    console.log('\n🚀 API pronta para uso!');
    console.log('📋 Use a collection Postman para testes completos');

  } catch (error) {
    console.log('\n❌ ERRO DURANTE O TESTE');
    console.log('======================');
    console.log('Erro:', error.message);
    console.log('\n💡 Verificações:');
    console.log('1. O servidor está rodando? (node src/server.js)');
    console.log('2. A porta 3001 está disponível?');
    console.log('3. O banco SQLite está configurado?');
    console.log('4. As variáveis de ambiente estão definidas?');
  }
}

// Executar teste
quickTest();
