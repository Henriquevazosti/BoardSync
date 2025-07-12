-- ========================================
-- BoardSync Database Schema - SQLite
-- Versão simplificada para desenvolvimento
-- ========================================

-- Organizações/Empresas
CREATE TABLE organizations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    settings TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

-- Usuários
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '👤',
    color TEXT DEFAULT '#0052cc',
    bg_color TEXT DEFAULT '#e6f3ff',
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
    last_login DATETIME,
    email_verified_at DATETIME,
    preferences TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

-- Workspaces/Projetos
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#0052cc',
    visibility TEXT DEFAULT 'private',
    settings TEXT DEFAULT '{}',
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

-- Boards/Quadros
CREATE TABLE boards (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    background_color TEXT DEFAULT '#ffffff',
    background_image TEXT,
    is_template INTEGER DEFAULT 0,
    settings TEXT DEFAULT '{}',
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

-- Listas/Colunas
CREATE TABLE board_lists (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT,
    settings TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    UNIQUE(board_id, position)
);

-- Labels/Etiquetas
CREATE TABLE labels (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    bg_color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cards/Cartões
CREATE TABLE cards (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    list_id TEXT REFERENCES board_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    priority TEXT DEFAULT 'media',
    category TEXT DEFAULT 'tarefa',
    parent_card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    is_blocked INTEGER DEFAULT 0,
    block_reason TEXT,
    due_date DATETIME,
    start_date DATETIME,
    completed_at DATETIME,
    estimated_hours REAL,
    actual_hours REAL,
    cover_image TEXT,
    settings TEXT DEFAULT '{}',
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    
    UNIQUE(list_id, position)
);

-- Membros do Workspace
CREATE TABLE workspace_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    invited_by TEXT REFERENCES users(id),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workspace_id, user_id)
);

-- Membros do Board
CREATE TABLE board_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    added_by TEXT REFERENCES users(id),
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(board_id, user_id)
);

-- Atribuições de Cards
CREATE TABLE card_assignments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES users(id),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(card_id, user_id)
);

-- Labels dos Cards
CREATE TABLE card_labels (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    label_id TEXT REFERENCES labels(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(card_id, label_id)
);

-- Comentários
CREATE TABLE comments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

-- Anexos
CREATE TABLE attachments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Checklists
CREATE TABLE checklists (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Itens dos Checklists
CREATE TABLE checklist_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    checklist_id TEXT REFERENCES checklists(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    position INTEGER NOT NULL,
    completed_by TEXT REFERENCES users(id),
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Atividades
CREATE TABLE activities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessões de usuário
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_workspaces_organization ON workspaces(organization_id);
CREATE INDEX idx_boards_workspace ON boards(workspace_id);
CREATE INDEX idx_board_lists_board ON board_lists(board_id);
CREATE INDEX idx_cards_list ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
CREATE INDEX idx_comments_card ON comments(card_id);
CREATE INDEX idx_activities_card ON activities(card_id);
CREATE INDEX idx_sessions_token ON user_sessions(token);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Organização padrão
INSERT INTO organizations (id, name, slug, description) 
VALUES ('default-org', 'BoardSync', 'boardsync', 'Organização padrão do BoardSync');

-- Usuário administrador padrão
INSERT INTO users (id, organization_id, email, password_hash, name, role) 
VALUES (
    'admin-user',
    'default-org',
    'admin@boardsync.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'admin'
);

-- Workspace padrão
INSERT INTO workspaces (id, organization_id, name, description, created_by) 
VALUES (
    'default-workspace',
    'default-org',
    'Projeto Principal',
    'Workspace padrão para desenvolvimento',
    'admin-user'
);

-- Board padrão
INSERT INTO boards (id, workspace_id, name, description, created_by) 
VALUES (
    'default-board',
    'default-workspace',
    'Kanban Board',
    'Board principal para organização de tarefas',
    'admin-user'
);

-- Listas padrão
INSERT INTO board_lists (id, board_id, name, position) VALUES
('list-todo', 'default-board', 'A Fazer', 1),
('list-doing', 'default-board', 'Em Progresso', 2),
('list-done', 'default-board', 'Concluído', 3);

-- Labels padrão
INSERT INTO labels (id, board_id, name, color, bg_color) VALUES
('label-bug', 'default-board', 'Bug', '#ffffff', '#d73a49'),
('label-feature', 'default-board', 'Feature', '#ffffff', '#0366d6'),
('label-improvement', 'default-board', 'Melhoria', '#ffffff', '#28a745');

-- Membros do Workspace padrão
INSERT INTO workspace_members (id, workspace_id, user_id, role, invited_by) 
VALUES ('default-member', 'default-workspace', 'admin-user', 'admin', 'admin-user');

-- Cards de exemplo
INSERT INTO cards (id, list_id, title, description, position, priority, created_by) VALUES
('card-1', 'list-todo', 'Configurar Backend', 'Configurar servidor Node.js e banco de dados', 1, 'alta', 'admin-user'),
('card-2', 'list-doing', 'Implementar API', 'Desenvolver endpoints REST da API', 1, 'alta', 'admin-user'),
('card-3', 'list-done', 'Setup Inicial', 'Configuração inicial do projeto', 1, 'media', 'admin-user');
