// Dados iniciais completamente limpos para produção
export const initialData = {
  users: {},
  activities: {},
  labels: {
    'correios': {
      id: 'correios',
      name: 'Correios',
      color: '#ffcc00',
      bgColor: '#fffbe6',
      logo: '/logos/correios.png'
    },
    'mercado-livre': {
      id: 'mercado-livre',
      name: 'Mercado Livre',
      color: '#ffe600',
      bgColor: '#fffde6',
      logo: '/logos/mercado-livre.png'
    },
    'shopee': {
      id: 'shopee',
      name: 'Shopee',
      color: '#ff5722',
      bgColor: '#fff3e0',
      logo: '/logos/shopee.png'
    },
    'americanas': {
      id: 'americanas',
      name: 'Americanas',
      color: '#e60014',
      bgColor: '#ffe6ea',
      logo: '/logos/americanas.png'
    },
    'fisiosmart': {
      id: 'fisiosmart',
      name: 'FisioSmart',
      color: '#00b8d9',
      bgColor: '#e6fcff',
      logo: '/logos/fisiosmart.png'
    },
    'temu': {
      id: 'temu',
      name: 'Temu',
      color: '#ff7f00',
      bgColor: '#fff7e6',
      logo: '/logos/temu.png'
    },
    'magalu': {
      id: 'magalu',
      name: 'Magazine Luiza',
      color: '#0074c1',
      bgColor: '#e6f3ff',
      logo: '/logos/magalu.png'
    }
  },
  companies: {},
  cards: {},
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'Backlog',
      cardIds: []
    },
    'column-2': {
      id: 'column-2',
      title: 'Em desenvolvimento',
      cardIds: []
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

// Configuração de categorias do sistema
export const categoryConfig = {
  criacao: {
    name: 'Criação',
    icon: '📖',
    color: '#0052cc',
    bgColor: '#e6f3ff'
  },
  troca: {
    name: 'Troca',
    icon: '🎯',
    color: '#6554c0',
    bgColor: '#f3f0ff'
  },
  erro: {
    name: 'Erro',
    icon: '❌',
    color: '#de350b',
    bgColor: '#ffebe6'
  },
  full: {
    name: 'Full',
    icon: '⚡',
    color: '#00875a',
    bgColor: '#e3fcef'
  },
  // Subcategorias
  'erro no pedido': {
    name: 'Erro no pedido',
    icon: '📦',
    color: '#0065ff',
    bgColor: '#e6f4ff',
    isSubtask: true
  },
  'estorno': {
    name: 'Estorno',
    icon: '🏧',
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
  return Object.values(cards).find(card => 
    card.id !== cardId && card.subtasks && card.subtasks.includes(cardId)
  );
};

export const getSubtasks = (parentCardId, cards) => {
  const parentCard = cards[parentCardId];
  return parentCard?.subtasks ? parentCard.subtasks.map(id => cards[id]).filter(Boolean) : [];
};

// Funções utilitárias para labels
export const getAllLabels = () => {
  return Object.values(initialData.labels);
};

export const getLabelById = (labelId) => {
  return initialData.labels[labelId];
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

export const getCardLabels = (card, allLabels) => {
  if (!card.labels || !Array.isArray(card.labels)) return [];
  return card.labels.map(labelId => allLabels[labelId]).filter(Boolean);
};

export const getCardAssignedUsers = (card, allUsers) => {
  if (!card.assignedUsers || !Array.isArray(card.assignedUsers)) return [];
  return card.assignedUsers.map(userId => allUsers[userId]).filter(Boolean);
};

export const generateUserId = () => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Avatars predefinidos para usuários criados via API
export const defaultAvatars = [
  '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🎨', '👨‍🎨',
  '👩‍🔬', '👨‍🔬', '👩‍🚀', '👨‍🚀', '👩‍⚕️', '👨‍⚕️',
  '👩‍🏫', '👨‍🏫', '👩‍💼', '👨‍💼'
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

// Cores predefinidas para usuários
export const defaultColors = [
  { color: '#0052cc', bgColor: '#e6f3ff' },
  { color: '#00875a', bgColor: '#e3fcef' },
  { color: '#de350b', bgColor: '#ffebe6' },
  { color: '#6554c0', bgColor: '#f3f0ff' },
  { color: '#00b8d9', bgColor: '#e6fcff' },
  { color: '#ff7f00', bgColor: '#fff7e6' },
  { color: '#9c2fff', bgColor: '#f5f0ff' },
  { color: '#ff5c28', bgColor: '#fff3e6' }
];

// Função para obter próxima cor disponível
export const getNextUserColor = () => {
  const usedColors = Object.values(initialData.users).map(user => user.color);
  const availableColors = defaultColors.filter(colorSet => !usedColors.includes(colorSet.color));
  
  if (availableColors.length > 0) {
    return availableColors[0];
  }
  
  // Se todas as cores estão em uso, retorna uma cor aleatória
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
};

// Função para obter próximo avatar disponível
export const getNextUserAvatar = () => {
  const usedAvatars = Object.values(initialData.users).map(user => user.avatar);
  const availableAvatars = defaultAvatars.filter(avatar => !usedAvatars.includes(avatar));
  
  if (availableAvatars.length > 0) {
    return availableAvatars[0];
  }
  
  // Se todos os avatars estão em uso, retorna um aleatório
  return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
};

// Funções utilitárias para datas
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return '';
  }
};

export const isOverdue = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const isDueToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
};

export const isDueSoon = (dateString, days = 3) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= days;
};

export default initialData;