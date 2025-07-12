import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/v1';

async function makeApiCall(method, endpoint, body = null, token = null) {
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

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function debugWorkspaces() {
  try {
    console.log('🔍 DEBUG - Verificando workspaces...');
    
    // 1. Login
    console.log('🔐 Fazendo login...');
    const loginResult = await makeApiCall('POST', '/auth/login', {
      email: 'henrique.vazosti@gmail.com',
      password: '123456'
    });
    console.log(`✅ Login: ${loginResult.user.name}`);
    const token = loginResult.token;

    // 2. Workspaces
    console.log('\n🏢 Listando workspaces...');
    const workspaces = await makeApiCall('GET', '/workspaces', null, token);
    console.log(`✅ ${workspaces.workspaces.length} workspaces encontrados`);
    
    workspaces.workspaces.forEach((ws, index) => {
      console.log(`  📁 ${index + 1}. ${ws.name}`);
      console.log(`     ID: "${ws.id}" (tipo: ${typeof ws.id})`);
      console.log(`     Organização: ${ws.organization_id}`);
      console.log(`     Role: ${ws.role}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugWorkspaces();
