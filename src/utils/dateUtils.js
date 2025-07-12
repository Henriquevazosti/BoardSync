// Utilitários para manipulação de datas

// Verificar se uma data está atrasada (overdue)
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// Verificar se uma data é hoje
export const isDueToday = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
};

// Verificar se uma data é em breve (próximos 7 dias)
export const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due > today && due <= nextWeek;
};

// Formatar data para exibição
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Formatar data e hora para exibição
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

// Obter status da data (overdue, today, soon, normal)
export const getDateStatus = (dueDate) => {
  if (!dueDate) return 'no-date';
  if (isOverdue(dueDate)) return 'overdue';
  if (isDueToday(dueDate)) return 'due-today';
  if (isDueSoon(dueDate)) return 'due-soon';
  return 'normal';
};
