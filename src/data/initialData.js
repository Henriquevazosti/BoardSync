export const initialData = {
  cards: {
    'card-1': {
      id: 'card-1',
      title: 'Configurar projeto',
      description: 'Configurar ambiente de desenvolvimento e dependências iniciais',
      priority: 'alta'
    },
    'card-2': {
      id: 'card-2',
      title: 'Criar componentes base',  
      description: 'Desenvolver componentes Card, Column e Board',
      priority: 'alta'
    },
    'card-3': {
      id: 'card-3',
      title: 'Implementar drag and drop',
      description: 'Adicionar funcionalidade de arrastar e soltar cards',
      priority: 'media'
    },
    'card-4': {
      id: 'card-4',
      title: 'Estilizar interface',
      description: 'Aplicar CSS e melhorar a aparência geral',
      priority: 'media'
    },
    'card-5': {
      id: 'card-5',
      title: 'Testes unitários',
      description: 'Escrever testes para os componentes principais',
      priority: 'baixa'
    },
    'card-6': {
      id: 'card-6',
      title: 'Deploy da aplicação',
      description: 'Configurar pipeline de deploy e publicar aplicação',
      priority: 'baixa'
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'A fazer',
      cardIds: ['card-1', 'card-2']
    },
    'column-2': {
      id: 'column-2',
      title: 'Em andamento',
      cardIds: ['card-3', 'card-4']
    },
    'column-3': {
      id: 'column-3',
      title: 'Concluído',
      cardIds: ['card-5', 'card-6']
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3']
};
