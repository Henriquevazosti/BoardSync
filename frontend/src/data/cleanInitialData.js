// Dados iniciais limpos para o BoardSync
export const cleanInitialData = {
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
    }
  },
  activities: {},
  labels: {
    'label-1': {
      id: 'label-1',
      name: 'Urgente',
      color: '#de350b',
      bgColor: '#ffebe6'
    },
    'label-2': {
      id: 'label-2',
      name: 'Backend',
      color: '#00875a',
      bgColor: '#e3fcef'
    },
    'label-3': {
      id: 'label-3',
      name: 'Frontend',
      color: '#0052cc',
      bgColor: '#e6f3ff'
    }
  },
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Configurar autenticação de usuário',
      description: 'Implementar login, registro e controle de acesso de usuários',
      priority: 'alta',
      category: 'historia',
      labels: ['label-2'],
      assignedUsers: ['user-1'],
      dueDate: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      isBlocked: false,
      blockReason: ''
    },
    'card-2': {
      id: 'card-2',
      title: 'Criar interface do dashboard',
      description: 'Desenvolver a interface principal do dashboard',
      priority: 'media',
      category: 'historia',
      labels: ['label-3'],
      assignedUsers: ['user-2'],
      dueDate: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      isBlocked: false,
      blockReason: ''
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Backlog',
      cardIds: ['card-1']
    },
    'column-2': {
      id: 'column-2',
      title: 'Em desenvolvimento',
      cardIds: ['card-2']
    },
    'column-3': {
      id: 'column-3',
      title: 'Em revisão',
      cardIds: []
    },
    'column-4': {
      id: 'column-4',
      title: 'Concluído',
      cardIds: []
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4']
};
