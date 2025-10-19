-- ========================================
-- BoardSync Database Schema - PostgreSQL
-- Estrutura profissional para gerenciamento de tarefas
-- ========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Organizações/Empresas
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT '👤',
    color VARCHAR(7) DEFAULT '#0052cc',
    bg_color VARCHAR(7) DEFAULT '#e6f3ff',
    role VARCHAR(50) DEFAULT 'member', -- admin, manager, member
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Workspaces/Projetos
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0052cc',
    visibility VARCHAR(20) DEFAULT 'private', -- public, private, team
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Boards/Quadros
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    background_color VARCHAR(7) DEFAULT '#ffffff',
    background_image TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Listas/Colunas
CREATE TABLE board_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    UNIQUE(board_id, position)
);

-- Labels/Etiquetas
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    bg_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards/Cartões
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES board_lists(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'media', -- baixa, media, alta
    category VARCHAR(50) DEFAULT 'tarefa',
    parent_card_id UUID REFERENCES cards(id) ON DELETE CASCADE, -- Para subtarefas
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    cover_image TEXT,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    UNIQUE(list_id, position)
);

-- ========================================
-- TABELAS DE RELACIONAMENTO
-- ========================================

-- Membros do Workspace
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, user_id)
);

-- Membros do Board
CREATE TABLE board_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(board_id, user_id)
);

-- Usuários atribuídos aos cards
CREATE TABLE card_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(card_id, user_id)
);

-- Labels atribuídas aos cards
CREATE TABLE card_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
    
    UNIQUE(card_id, label_id)
);

-- ========================================
-- TABELAS DE ATIVIDADES E LOGS
-- ========================================

-- Atividades/Histórico
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- card_created, card_moved, comment_added, etc.
    description TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Histórico de edições de comentários
CREATE TABLE comment_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    previous_content TEXT NOT NULL,
    edited_by UUID REFERENCES users(id),
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anexos
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELAS DE NOTIFICAÇÕES E CHAT
-- ========================================

-- Notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat de equipe
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
    content TEXT,
    file_url TEXT,
    reply_to UUID REFERENCES chat_messages(id),
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices principais
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_workspaces_organization_id ON workspaces(organization_id);
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_board_lists_board_id ON board_lists(board_id);
CREATE INDEX idx_board_lists_position ON board_lists(board_id, position);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_position ON cards(list_id, position);
CREATE INDEX idx_cards_parent_id ON cards(parent_card_id);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_activities_card_id ON activities(card_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_comments_card_id ON comments(card_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(user_id, read_at);

-- Índices compostos para queries frequentes
CREATE INDEX idx_cards_list_position ON cards(list_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_cards_assignee_lookup ON card_assignees(user_id, card_id);
CREATE INDEX idx_workspace_members_lookup ON workspace_members(workspace_id, user_id);
CREATE INDEX idx_board_members_lookup ON board_members(board_id, user_id);

-- ========================================
-- TRIGGERS PARA AUDITORIA
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_board_lists_updated_at BEFORE UPDATE ON board_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para cards com informações completas
CREATE OR REPLACE VIEW cards_detailed AS
SELECT 
    c.*,
    bl.name as list_name,
    bl.position as list_position,
    b.name as board_name,
    w.name as workspace_name,
    creator.name as created_by_name,
    ARRAY_AGG(DISTINCT u.name) FILTER (WHERE u.id IS NOT NULL) as assignee_names,
    ARRAY_AGG(DISTINCT l.name) FILTER (WHERE l.id IS NOT NULL) as label_names,
    COUNT(DISTINCT comments.id) as comment_count,
    COUNT(DISTINCT attachments.id) as attachment_count,
    COUNT(DISTINCT subtasks.id) as subtask_count
FROM cards c
LEFT JOIN board_lists bl ON c.list_id = bl.id
LEFT JOIN boards b ON bl.board_id = b.id
LEFT JOIN workspaces w ON b.workspace_id = w.id
LEFT JOIN users creator ON c.created_by = creator.id
LEFT JOIN card_assignees ca ON c.id = ca.card_id
LEFT JOIN users u ON ca.user_id = u.id
LEFT JOIN card_labels cl ON c.id = cl.card_id
LEFT JOIN labels l ON cl.label_id = l.id
LEFT JOIN comments ON c.id = comments.card_id AND comments.deleted_at IS NULL
LEFT JOIN attachments ON c.id = attachments.card_id
LEFT JOIN cards subtasks ON c.id = subtasks.parent_card_id AND subtasks.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, bl.name, bl.position, b.name, w.name, creator.name;

-- View para atividades recentes
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    a.*,
    u.name as user_name,
    u.avatar as user_avatar,
    c.title as card_title,
    b.name as board_name,
    w.name as workspace_name
FROM activities a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN cards c ON a.card_id = c.id
LEFT JOIN boards b ON a.board_id = b.id
LEFT JOIN workspaces w ON a.workspace_id = w.id
ORDER BY a.created_at DESC;

-- ========================================
-- DADOS INICIAIS/SEED - COMENTADOS PARA PRODUÇÃO
-- ========================================

-- Os dados abaixo são exemplos de demonstração e devem ser criados via API em produção

-- Exemplo de organização padrão (comentado para produção)
-- INSERT INTO organizations (id, name, slug, description) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'BoardSync Demo', 'boardsync-demo', 'Organização de demonstração do BoardSync');

-- Exemplo de usuários padrão (comentado para produção)
-- INSERT INTO users (id, organization_id, email, password_hash, name, avatar, color, bg_color, role) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@boardsync.com', crypt('admin123', gen_salt('bf')), 'Administrador', '👨‍💼', '#0052cc', '#e6f3ff', 'admin'),
-- ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'ana.silva@boardsync.com', crypt('password123', gen_salt('bf')), 'Ana Silva', '👩‍💻', '#00875a', '#e3fcef', 'member'),
-- ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'carlos.santos@boardsync.com', crypt('password123', gen_salt('bf')), 'Carlos Santos', '👨‍💼', '#de350b', '#ffebe6', 'member');

-- Exemplo de workspace padrão (comentado para produção)
-- INSERT INTO workspaces (id, organization_id, name, description, created_by) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Projeto Principal', 'Workspace principal do projeto', '550e8400-e29b-41d4-a716-446655440001');

-- Exemplo de board padrão (comentado para produção)
-- INSERT INTO boards (id, workspace_id, name, description, created_by) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'Desenvolvimento', 'Board para gerenciar o desenvolvimento', '550e8400-e29b-41d4-a716-446655440001');

-- Exemplo de listas padrão (comentado para produção)
-- INSERT INTO board_lists (id, board_id, name, position) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'Backlog', 1),
-- ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', 'Em Desenvolvimento', 2),
-- ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440020', 'Em Revisão', 3),
-- ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440020', 'Concluído', 4);

-- Exemplo de labels padrão (comentado para produção)
-- INSERT INTO labels (id, board_id, name, color, bg_color) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', 'Frontend', '#0052cc', '#e6f3ff'),
-- ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440020', 'Backend', '#00875a', '#e3fcef'),
-- ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440020', 'Urgente', '#de350b', '#ffebe6');

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Habilitar RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Exemplo de política (usuários só veem dados da sua organização)
CREATE POLICY users_organization_policy ON users
    FOR ALL TO authenticated
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================

-- Função para mover card entre listas
CREATE OR REPLACE FUNCTION move_card(
    p_card_id UUID,
    p_new_list_id UUID,
    p_new_position INTEGER,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    old_list_id UUID;
    old_position INTEGER;
BEGIN
    -- Buscar posição atual
    SELECT list_id, position INTO old_list_id, old_position
    FROM cards WHERE id = p_card_id;
    
    -- Ajustar posições na lista antiga
    UPDATE cards 
    SET position = position - 1 
    WHERE list_id = old_list_id 
    AND position > old_position;
    
    -- Ajustar posições na nova lista
    UPDATE cards 
    SET position = position + 1 
    WHERE list_id = p_new_list_id 
    AND position >= p_new_position;
    
    -- Mover o card
    UPDATE cards 
    SET list_id = p_new_list_id, position = p_new_position 
    WHERE id = p_card_id;
    
    -- Registrar atividade
    INSERT INTO activities (card_id, user_id, action_type, description, old_value, new_value)
    VALUES (p_card_id, p_user_id, 'card_moved', 'Card movido entre listas', 
            jsonb_build_object('list_id', old_list_id), 
            jsonb_build_object('list_id', p_new_list_id));
END;
$$ LANGUAGE plpgsql;
