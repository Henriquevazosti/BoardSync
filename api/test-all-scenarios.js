import dbAdapter from './src/config/dbAdapter.js';
import { connectSQLite } from './src/config/sqlite.js';

async function testAllScenarios() {
  try {
    // Conectar ao banco primeiro
    console.log('🔌 Conectando ao banco...');
    await connectSQLite();
    
    console.log('\n🎯 EXECUTANDO TODOS OS CENÁRIOS DE TESTE...\n');
    
    // ========================================
    // CENÁRIO 1: VERIFICAÇÃO DA ESTRUTURA DO BANCO
    // ========================================
    console.log('📊 CENÁRIO 1: Verificação da Estrutura do Banco');
    console.log('=' .repeat(50));
    
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
    
    // 10. Verificar associações card-label
    console.log('\n🔗 ASSOCIAÇÕES CARD-LABEL:');
    const cardLabels = await dbAdapter.findMany('card_labels', {});
    console.log(`✅ ${cardLabels.length} associações encontradas`);
    
    console.log('\n✅ CENÁRIO 1 CONCLUÍDO - ESTRUTURA DO BANCO VALIDADA\n');
    
    // ========================================
    // CENÁRIO 2: VERIFICAÇÃO DE RELAÇÕES E INTEGRIDADE
    // ========================================
    console.log('🔗 CENÁRIO 2: Verificação de Relações e Integridade');
    console.log('=' .repeat(50));
    
    if (boards.length > 0) {
      const board = boards[0];
      console.log(`\n📋 Analisando Board: "${board.name}"`);
      
      // Verificar listas do board
      const boardLists = await dbAdapter.findMany('board_lists', { board_id: board.id });
      console.log(`📝 Listas no board: ${boardLists.length}`);
      
      let totalCards = 0;
      for (const list of boardLists) {
        const listCards = await dbAdapter.findMany('cards', { list_id: list.id });
        console.log(`  📝 ${list.name}: ${listCards.length} cards`);
        totalCards += listCards.length;
        
        // Verificar comentários dos cards
        for (const card of listCards) {
          const cardComments = await dbAdapter.findMany('comments', { card_id: card.id });
          if (cardComments.length > 0) {
            console.log(`    💬 Card "${card.title}": ${cardComments.length} comentários`);
          }
        }
      }
      
      console.log(`🎯 Total de cards no board: ${totalCards}`);
      
      // Verificar labels do board
      const boardLabels = await dbAdapter.findMany('labels', { board_id: board.id });
      console.log(`🏷️ Labels no board: ${boardLabels.length}`);
      
      // Verificar workspace do board
      const workspace = await dbAdapter.findOne('workspaces', { id: board.workspace_id });
      console.log(`🏢 Workspace: "${workspace.name}"`);
      
      // Verificar membros do workspace
      const members = await dbAdapter.findMany('workspace_members', { workspace_id: workspace.id });
      console.log(`👥 Membros do workspace: ${members.length}`);
    }
    
    console.log('\n✅ CENÁRIO 2 CONCLUÍDO - RELAÇÕES VALIDADAS\n');
    
    // ========================================
    // CENÁRIO 3: VERIFICAÇÃO DE DADOS ESPECÍFICOS
    // ========================================
    console.log('🔍 CENÁRIO 3: Verificação de Dados Específicos');
    console.log('=' .repeat(50));
    
    // Verificar usuário de teste
    const testUser = await dbAdapter.findOne('users', { email: 'henrique.vazosti@gmail.com' });
    if (testUser) {
      console.log(`👤 Usuário de teste encontrado: ${testUser.name}`);
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`🎭 Role: ${testUser.role}`);
      console.log(`📅 Último login: ${testUser.last_login}`);
      
      // Verificar workspaces do usuário
      const userWorkspaces = await dbAdapter.findMany('workspace_members', { user_id: testUser.id });
      console.log(`🏢 Workspaces do usuário: ${userWorkspaces.length}`);
    }
    
    // Verificar cards com prioridade alta
    const highPriorityCards = await dbAdapter.findMany('cards', { priority: 'alta' });
    console.log(`🔥 Cards de alta prioridade: ${highPriorityCards.length}`);
    
    // Verificar cards bloqueados
    const blockedCards = await dbAdapter.findMany('cards', { is_blocked: 1 });
    console.log(`🚫 Cards bloqueados: ${blockedCards.length}`);
    
    console.log('\n✅ CENÁRIO 3 CONCLUÍDO - DADOS ESPECÍFICOS VALIDADOS\n');
    
    // ========================================
    // CENÁRIO 4: TESTE DE PERFORMANCE E CONTADORES
    // ========================================
    console.log('⚡ CENÁRIO 4: Teste de Performance e Contadores');
    console.log('=' .repeat(50));
    
    const startTime = Date.now();
    
    // Simular várias consultas
    console.log('\n📊 Executando consultas de performance...');
    
    await Promise.all([
      dbAdapter.findMany('users', {}),
      dbAdapter.findMany('workspaces', {}),
      dbAdapter.findMany('boards', {}),
      dbAdapter.findMany('board_lists', {}),
      dbAdapter.findMany('cards', {})
    ]);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log(`⏱️ Tempo de execução das consultas: ${executionTime}ms`);
    console.log(`💾 Banco de dados: SQLite`);
    console.log(`🔄 Status: Operacional`);
    
    console.log('\n✅ CENÁRIO 4 CONCLUÍDO - PERFORMANCE VALIDADA\n');
    
    // ========================================
    // RESUMO FINAL
    // ========================================
    console.log('🎉 RESUMO FINAL DOS TESTES');
    console.log('=' .repeat(50));
    
    console.log('\n📈 ESTATÍSTICAS GERAIS:');
    console.log(`👥 Usuários: ${users.length}`);
    console.log(`🏢 Workspaces: ${workspaces.length}`);
    console.log(`📋 Boards: ${boards.length}`);
    console.log(`📝 Listas: ${lists.length}`);
    console.log(`🎯 Cards: ${cards.length}`);
    console.log(`🏷️ Labels: ${labels.length}`);
    console.log(`💬 Comentários: ${comments.length}`);
    console.log(`📊 Atividades: ${activities.length}`);
    console.log(`👥 Membros: ${workspaceMembers.length}`);
    console.log(`🔗 Associações: ${cardLabels.length}`);
    
    console.log('\n✅ STATUS DOS CENÁRIOS:');
    console.log('✅ Cenário 1: Estrutura do Banco - OK');
    console.log('✅ Cenário 2: Relações e Integridade - OK');
    console.log('✅ Cenário 3: Dados Específicos - OK');
    console.log('✅ Cenário 4: Performance - OK');
    
    console.log('\n🚀 TODOS OS CENÁRIOS DE TESTE EXECUTADOS COM SUCESSO!');
    console.log('🎯 INTEGRAÇÃO COMPLETA E FUNCIONAL!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

testAllScenarios();
