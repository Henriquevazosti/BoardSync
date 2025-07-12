import { connectSQLite, querySQLite } from './src/config/sqlite.js';

async function checkTables() {
  try {
    // Conectar ao banco primeiro
    console.log('🔌 Conectando ao banco...');
    await connectSQLite();
    
    // Verificar quais tabelas existem
    console.log('\n🔍 Verificando tabelas existentes...');
    
    const tables = querySQLite(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    console.log('\n📊 TABELAS ENCONTRADAS:');
    tables.forEach(table => {
      console.log(`  ✅ ${table.name}`);
    });
    
    // Verificar se as tabelas essenciais existem
    const essentialTables = ['users', 'workspaces', 'boards', 'lists', 'cards', 'labels', 'comments'];
    console.log('\n🔍 VERIFICANDO TABELAS ESSENCIAIS:');
    
    essentialTables.forEach(tableName => {
      const exists = tables.some(t => t.name === tableName);
      if (exists) {
        console.log(`  ✅ ${tableName} - OK`);
      } else {
        console.log(`  ❌ ${tableName} - FALTANDO`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkTables();
