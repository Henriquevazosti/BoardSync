#!/usr/bin/env node

import sqlite from './src/config/sqlite.js';

console.log('🔍 Verificando banco SQLite...\n');

try {
  const db = sqlite.connect();
  
  console.log('📊 Organizações:');
  const orgs = sqlite.query('SELECT * FROM organizations');
  console.table(orgs);
  
  console.log('\n👥 Usuários:');
  const users = sqlite.query('SELECT id, email, name, organization_id FROM users');
  console.table(users);
  
  console.log('\n🏢 Workspaces:');
  const workspaces = sqlite.query('SELECT * FROM workspaces');
  console.table(workspaces);
  
  console.log('\n🤝 Workspace Members:');
  const members = sqlite.query('SELECT * FROM workspace_members');
  console.table(members);
  
  console.log('\n📋 Boards:');
  const boards = sqlite.query('SELECT * FROM boards');
  console.table(boards);
  
  console.log('\n📝 Board Lists:');
  const lists = sqlite.query('SELECT * FROM board_lists');
  console.table(lists);
  
  sqlite.close();
} catch (error) {
  console.error('❌ Erro:', error.message);
}
