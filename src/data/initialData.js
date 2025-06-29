export const initialData = {
  users: {
    'user-1': {
      id: 'user-1',
      name: 'Ana Silva',
      email: 'ana.silva@company.com',
      avatar: '👩‍💻',
      color: '#0052cc',
      bgColor: '#e6f3ff'
    },
    'user-2': {
      id: 'user-2',
      name: 'Carlos Santos',
      email: 'carlos.santos@company.com',
      avatar: '👨‍💼',
      color: '#00875a',
      bgColor: '#e3fcef'
    },
    'user-3': {
      id: 'user-3',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@company.com',
      avatar: '👩‍🎨',
      color: '#de350b',
      bgColor: '#ffebe6'
    },
    'user-4': {
      id: 'user-4',
      name: 'João Pedro',
      email: 'joao.pedro@company.com',
      avatar: '👨‍🔬',
      color: '#6554c0',
      bgColor: '#f3f0ff'
    },
    'user-5': {
      id: 'user-5',
      name: 'Fernanda Costa',
      email: 'fernanda.costa@company.com',
      avatar: '👩‍🚀',
      color: '#00b8d9',
      bgColor: '#e6fcff'
    }
  },
  labels: {
    'label-1': {
      id: 'label-1',
      name: 'Frontend',
      color: '#0052cc',
      bgColor: '#e6f3ff'
    },
    'label-2': {
      id: 'label-2',
      name: 'Backend',
      color: '#00875a',
      bgColor: '#e3fcef'
    },
    'label-3': {
      id: 'label-3',
      name: 'Urgente',
      color: '#de350b',
      bgColor: '#ffebe6'
    },
    'label-4': {
      id: 'label-4',
      name: 'API',
      color: '#6554c0',
      bgColor: '#f3f0ff'
    },
    'label-5': {
      id: 'label-5',
      name: 'Documentação',
      color: '#00b8d9',
      bgColor: '#e6fcff'
    }
  },
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Configurar ambiente de desenvolvimento e dependências iniciais do projeto',
      priority: 'alta',
      category: 'historia',
      isBlocked: false,
      blockReason: '',
      labels: ['label-1', 'label-2'],
      assignedUsers: ['user-1', 'user-2']
    },
    'card-2': {
      id: 'card-2',
      title: 'Sistema de autenticação',
      description: 'Implementar login, registro e controle de acesso de usuários',
      priority: 'alta',
      category: 'epico',
      isBlocked: true,
      blockReason: 'Aguardando definição dos requisitos de segurança pela equipe de compliance',
      labels: ['label-2', 'label-3', 'label-4'],
      assignedUsers: ['user-3']
    },
    'card-3': {
      id: 'card-3',
      title: 'Implementar drag and drop',
      description: 'Adicionar funcionalidade de arrastar e soltar cards entre colunas',
      priority: 'media',
      category: 'historia',
      isBlocked: false,
      blockReason: '',
      labels: ['label-1'],
      assignedUsers: ['user-1']
    },
    'card-4': {
      id: 'card-4',
      title: 'Erro ao salvar card vazio',
      description: 'Sistema permite salvar cards sem título causando problemas na interface',
      priority: 'alta',
      category: 'bug',
      isBlocked: false,
      blockReason: '',
      labels: ['label-1', 'label-3'],
      assignedUsers: ['user-4', 'user-1']
    },
    'card-5': {
      id: 'card-5',
      title: 'Documentação da API',
      description: 'Criar documentação completa dos endpoints da API',
      priority: 'baixa',
      category: 'atividade',
      isBlocked: false,
      blockReason: '',
      labels: ['label-5', 'label-4'],
      assignedUsers: ['user-5']
    },
    'card-6': {
      id: 'card-6',
      title: 'Deploy em produção',
      description: 'Configurar pipeline de CI/CD e fazer deploy da aplicação',
      priority: 'media',
      category: 'atividade',
      isBlocked: false,
      blockReason: '',
      labels: ['label-2'],
      assignedUsers: ['user-2']
    },
    'card-7': {
      id: 'card-7',
      title: 'Performance do carregamento',
      description: 'Cards demoram muito para carregar quando há muitos itens',
      priority: 'media',
      category: 'bug',
      isBlocked: false,
      blockReason: '',
      labels: ['label-1', 'label-2'],
      assignedUsers: ['user-4']
    },
    'card-8': {
      id: 'card-8',
      title: 'Sistema de notificações',
      description: 'Implementar notificações em tempo real para mudanças no board',
      priority: 'baixa',
      category: 'epico',
      isBlocked: false,
      blockReason: '',
      labels: ['label-1', 'label-2', 'label-4'],
      assignedUsers: ['user-1', 'user-2', 'user-3']
    },
    'card-9': {
      id: 'card-9',
      title: 'Teste de integração da API',
      description: 'Criar testes para validar integração com sistema de notificações',
      priority: 'media',
      category: 'sub-teste',
      parentId: 'card-8',
      isBlocked: false,
      blockReason: '',
      labels: ['label-4'],
      assignedUsers: ['user-4']
    },
    'card-10': {
      id: 'card-10',
      title: 'Corrigir bug de conexão WebSocket',
      description: 'WebSocket não reconecta automaticamente após perda de conexão',
      priority: 'alta',
      category: 'sub-bug',
      parentId: 'card-8',
      isBlocked: false,
      blockReason: '',
      labels: ['label-2', 'label-3'],
      assignedUsers: ['user-2']
    },
    'card-11': {
      id: 'card-11',
      title: 'Documentar endpoints de notificação',
      description: 'Criar documentação detalhada dos novos endpoints',
      priority: 'baixa',
      category: 'atividade-complementar',
      parentId: 'card-8',
      isBlocked: false,
      blockReason: '',
      labels: ['label-5'],
      assignedUsers: ['user-5']
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Backlog',
      cardIds: ['card-1', 'card-2', 'card-4']
    },
    'column-2': {
      id: 'column-2',
      title: 'Em desenvolvimento',
      cardIds: ['card-3', 'card-7']
    },
    'column-3': {
      id: 'column-3',
      title: 'Em revisão',
      cardIds: ['card-5']
    },
    'column-4': {
      id: 'column-4',
      title: 'Concluído',
      cardIds: ['card-6', 'card-8', 'card-9', 'card-10', 'card-11']
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4']
};

// Configurações das categorias
export const categoryConfig = {
  historia: {
    name: 'História',
    icon: '📖',
    color: '#0052cc',
    bgColor: '#e6f3ff'
  },
  epico: {
    name: 'Épico',
    icon: '🎯',
    color: '#6554c0',
    bgColor: '#f3f0ff'
  },
  bug: {
    name: 'Bug',
    icon: '🐛',
    color: '#de350b',
    bgColor: '#ffebe6'
  },
  atividade: {
    name: 'Atividade',
    icon: '⚡',
    color: '#00875a',
    bgColor: '#e3fcef'
  },
  // Subcategorias
  'sub-teste': {
    name: 'Sub Teste',
    icon: '🧪',
    color: '#0065ff',
    bgColor: '#e6f4ff',
    isSubtask: true
  },
  'sub-bug': {
    name: 'Sub Bug',
    icon: '🔧',
    color: '#ff5630',
    bgColor: '#ffebe6',
    isSubtask: true
  },
  'atividade-complementar': {
    name: 'Atividade Complementar',
    icon: '🔗',
    color: '#00b8d9',
    bgColor: '#e6fcff',
    isSubtask: true
  }
};

// Funções utilitárias para subtarefas
export const getSubtaskCategories = () => {
  return Object.keys(categoryConfig).filter(key => categoryConfig[key].isSubtask);
};

export const getMainCategories = () => {
  return Object.keys(categoryConfig).filter(key => !categoryConfig[key].isSubtask);
};

export const isSubtask = (category) => {
  return categoryConfig[category]?.isSubtask || false;
};

export const getParentCard = (cardId, cards) => {
  const card = cards[cardId];
  return card?.parentId ? cards[card.parentId] : null;
};

export const getSubtasks = (parentCardId, cards) => {
  return Object.values(cards).filter(card => card.parentId === parentCardId);
};

// Funções utilitárias para labels
export const getAllLabels = () => {
  return Object.values(initialData.labels);
};

export const getLabelById = (labelId) => {
  return initialData.labels[labelId];
};

export const getCardLabels = (card, allLabels) => {
  if (!card.labels || !Array.isArray(card.labels)) return [];
  return card.labels.map(labelId => allLabels[labelId]).filter(Boolean);
};

export const generateLabelId = () => {
  return `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Funções utilitárias para usuários
export const getAllUsers = () => {
  return Object.values(initialData.users);
};

export const getUserById = (userId) => {
  return initialData.users[userId];
};

export const getCardAssignedUsers = (card, allUsers) => {
  if (!card.assignedUsers || !Array.isArray(card.assignedUsers)) return [];
  return card.assignedUsers.map(userId => allUsers[userId]).filter(Boolean);
};

export const generateUserId = () => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Avatars predefinidos
export const defaultAvatars = [
  '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🎨', '👨‍🎨',
  '👩‍🔬', '👨‍🔬', '👩‍🚀', '👨‍🚀', '👩‍⚕️', '👨‍⚕️',
  '👩‍🏫', '👨‍🏫', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳',
  '👩‍🔧', '👨‍🔧', '👩‍🎤', '👨‍🎤', '👩‍🎯', '👨‍🎯'
];

// Cores predefinidas para labels
export const labelColors = [
  { name: 'Azul', color: '#0052cc', bgColor: '#e6f3ff' },
  { name: 'Verde', color: '#00875a', bgColor: '#e3fcef' },
  { name: 'Vermelho', color: '#de350b', bgColor: '#ffebe6' },
  { name: 'Roxo', color: '#6554c0', bgColor: '#f3f0ff' },
  { name: 'Ciano', color: '#00b8d9', bgColor: '#e6fcff' },
  { name: 'Laranja', color: '#ff8b00', bgColor: '#fff4e6' },
  { name: 'Rosa', color: '#e91e63', bgColor: '#fce4ec' },
  { name: 'Amarelo', color: '#ff9800', bgColor: '#fff8e1' },
  { name: 'Cinza', color: '#5e6c84', bgColor: '#f4f5f7' },
  { name: 'Marrom', color: '#8d6e63', bgColor: '#efebe9' }
];
