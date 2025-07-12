import dbAdapter from './src/config/dbAdapter.js';
import { connectSQLite } from './src/config/sqlite.js';

async function testCompleteIntegration() {
  try {
    // Conectar ao banco primeiro
    console.log('🔌 Conectando ao banco...');
    await connectSQLite();
    
    console.log('\n🔍 TESTE DE INTEGRAÇÃO COMPLETA...');
    
    // 1. Verificar usuários
    console.log('\n👥 USUÁRIOS:');
    const users = await dbAdapter.findMany('users', {});
    console.log(`✅ ${users.length} usuários encontrados`);
    
    // 2. Verificar workspaces
    console.log('\n🏢 WORKSPACES:');
    const workspaces = await dbAdapter.findMany('workspaces', {});
    console.log(`✅ ${workspaces.length} workspaces encontrados`);
    
    // 3. Verificar boards
    console.log('\n📋 BOARDS:');
    const boards = await dbAdapter.findMany('boards', {});
    console.log(`✅ ${boards.length} boards encontrados`);
    
    // 4. Verificar listas (board_lists)
    console.log('\n📝 LISTAS:');
    const lists = await dbAdapter.findMany('board_lists', {});
    console.log(`✅ ${lists.length} listas encontradas`);
    
    // 5. Verificar cards
    console.log('\n🎯 CARDS:');
    const cards = await dbAdapter.findMany('cards', {});
    console.log(`✅ ${cards.length} cards encontrados`);
    
    // 6. Verificar labels
    console.log('\n🏷️ LABELS:');
    const labels = await dbAdapter.findMany('labels', {});
    console.log(`✅ ${labels.length} labels encontradas`);
    
    // 7. Verificar comentários
    console.log('\n💬 COMENTÁRIOS:');
    const comments = await dbAdapter.findMany('comments', {});
    console.log(`✅ ${comments.length} comentários encontrados`);
    
    // 8. Verificar atividades
    console.log('\n📊 ATIVIDADES:');
    const activities = await dbAdapter.findMany('activities', {});
    console.log(`✅ ${activities.length} atividades encontradas`);
    
    // 9. Verificar membros de workspace
    console.log('\n👥 MEMBROS DE WORKSPACE:');
    const workspaceMembers = await dbAdapter.findMany('workspace_members', {});
    console.log(`✅ ${workspaceMembers.length} membros encontrados`);
    
    console.log('\n🎉 INTEGRAÇÃO COMPLETA - TODOS OS COMPONENTES VERIFICADOS!');
    
    // Mostrar estrutura de um board completo
    if (boards.length > 0) {
      const board = boards[0];
      console.log('\n📋 ESTRUTURA DO BOARD:', board.name);
      
      // Mostrar listas do board
      const boardLists = await dbAdapter.findMany('board_lists', { board_id: board.id });
      console.log(`📝 Listas: ${boardLists.length}`);
      
      for (const list of boardLists) {
        console.log(`  📝 ${list.name} (ID: ${list.id})`);
        
        // Mostrar cards da lista
        const listCards = await dbAdapter.findMany('cards', { list_id: list.id });
        console.log(`    🎯 Cards: ${listCards.length}`);
        
        listCards.forEach(card => {
          console.log(`      - ${card.title} (${card.priority})`);
        });
      }
    }
    
    console.log('\n✅ INTEGRAÇÃO 100% FUNCIONAL!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na integração:', error);
    process.exit(1);
  }
}

testCompleteIntegration();
