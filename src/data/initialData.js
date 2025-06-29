export const initialData = {
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Configurar ambiente de desenvolvimento e dependências iniciais do projeto',
      priority: 'alta',
      category: 'historia'
    },
    'card-2': {
      id: 'card-2',
      title: 'Sistema de autenticação',
      description: 'Implementar login, registro e controle de acesso de usuários',
      priority: 'alta',
      category: 'epico'
    },
    'card-3': {
      id: 'card-3',
      title: 'Implementar drag and drop',
      description: 'Adicionar funcionalidade de arrastar e soltar cards entre colunas',
      priority: 'media',
      category: 'historia'
    },
    'card-4': {
      id: 'card-4',
      title: 'Erro ao salvar card vazio',
      description: 'Sistema permite salvar cards sem título causando problemas na interface',
      priority: 'alta',
      category: 'bug'
    },
    'card-5': {
      id: 'card-5',
      title: 'Documentação da API',
      description: 'Criar documentação completa dos endpoints da API',
      priority: 'baixa',
      category: 'atividade'
    },
    'card-6': {
      id: 'card-6',
      title: 'Deploy em produção',
      description: 'Configurar pipeline de CI/CD e fazer deploy da aplicação',
      priority: 'media',
      category: 'atividade'
    },
    'card-7': {
      id: 'card-7',
      title: 'Performance do carregamento',
      description: 'Cards demoram muito para carregar quando há muitos itens',
      priority: 'media',
      category: 'bug'
    },
    'card-8': {
      id: 'card-8',
      title: 'Sistema de notificações',
      description: 'Implementar notificações em tempo real para mudanças no board',
      priority: 'baixa',
      category: 'epico'
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
      cardIds: ['card-6', 'card-8']
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
  }
};
