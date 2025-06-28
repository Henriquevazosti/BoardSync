export const initialCards = [
  {
    id: 1,
    title: "Configurar projeto",
    description: "Configurar ambiente de desenvolvimento e dependências iniciais",
    priority: "high",
    status: "todo"
  },
  {
    id: 2,
    title: "Criar componentes base",
    description: "Desenvolver componentes Card, Column e Board",
    priority: "high",
    status: "todo"
  },
  {
    id: 3,
    title: "Implementar drag and drop",
    description: "Adicionar funcionalidade de arrastar e soltar cards",
    priority: "medium",
    status: "inprogress"
  },
  {
    id: 4,
    title: "Estilizar interface",
    description: "Aplicar CSS e melhorar a aparência geral",
    priority: "medium",
    status: "inprogress"
  },
  {
    id: 5,
    title: "Testes unitários",
    description: "Escrever testes para os componentes principais",
    priority: "low",
    status: "done"
  },
  {
    id: 6,
    title: "Deploy da aplicação",
    description: "Configurar pipeline de deploy e publicar aplicação",
    priority: "low",
    status: "done"
  }
];

export const columns = [
  {
    id: "todo",
    title: "A fazer",
    cards: initialCards.filter(card => card.status === "todo")
  },
  {
    id: "inprogress", 
    title: "Em andamento",
    cards: initialCards.filter(card => card.status === "inprogress")
  },
  {
    id: "done",
    title: "Concluído", 
    cards: initialCards.filter(card => card.status === "done")
  }
];
