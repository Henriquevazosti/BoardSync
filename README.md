# 📋 BoardSync

Um sistema completo de gerenciamento de projetos estilo Kanban, inspirado no Trello e Jira, desenvolvido com React e funcionalidades avançadas.

![BoardSync](https://img.shields.io/badge/React-18+-blue.svg)
![Status](https://img.shields.io/badge/Status-Completo-success.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Funcionalidades

### 🔐 **Sistema de Autenticação**
- ✅ Login e registro de usuários
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão
- ✅ Validação de formulários

### 📋 **Quadro Kanban Avançado**
- ✅ Drag & Drop nativo entre colunas
- ✅ Sistema de categorias completo:
  - 📖 **História** - Funcionalidades do usuário
  - 🎯 **Épico** - Grandes iniciativas
  - 🐛 **Bug** - Correções necessárias
  - ⚡ **Atividade** - Tarefas gerais
  - 🔧 **Subtarefas** - Sub Teste, Sub Bug, Atividade Complementar
- ✅ Filtros visuais por tipo
- ✅ Hierarquia pai-filho para subtarefas

### 👥 **Gestão de Usuários**
- ✅ Sistema completo de usuários
- ✅ Atribuição de cards a pessoas
- ✅ Avatars personalizados (24 opções)
- ✅ Cores customizáveis por usuário
- ✅ Gerenciamento CRUD de usuários

### 🏷️ **Sistema de Labels/Tags**
- ✅ Criação e edição de labels
- ✅ 10 cores predefinidas
- ✅ Aplicação múltipla nos cards
- ✅ Gerenciamento visual

### 📅 **Datas e Prazos**
- ✅ Datas de vencimento nos cards
- ✅ Indicadores visuais inteligentes:
  - 🟢 **Normal** - Prazo tranquilo
  - 🔵 **Vence em breve** - Próximos 3 dias
  - 🟡 **Vence hoje** - Urgente (com animação)
  - 🔴 **Vencido** - Atrasado (com animação)
- ✅ Filtros por status de prazo
- ✅ Estatísticas em tempo real

### 🚫 **Sistema de Bloqueio**
- ✅ Bloqueio de cards com motivo
- ✅ Visual diferenciado
- ✅ Desabilitação de movimentação
- ✅ Gerenciamento de bloqueios

### ✏️ **Edição Avançada**
- ✅ Edição inline completa
- ✅ Todos os campos editáveis
- ✅ Modal de criação robusto
- ✅ Validações em tempo real

### 🎨 **Sistema de Temas**
- ✅ 5 temas disponíveis:
  - ☀️ **Claro** - Tema padrão
  - 🌙 **Escuro** - Dark mode completo
  - 🌊 **Azul Oceano** - Tema azul
  - 🔮 **Roxo Místico** - Tema roxo
  - 🌿 **Verde Natureza** - Tema verde
- ✅ Configurações personalizáveis:
  - 📝 Tamanho da fonte (Pequena, Média, Grande)
  - 🔘 Bordas arredondadas (4 níveis)
  - ⚡ Animações (ligado/desligado)
  - 📏 Modo compacto
- ✅ Persistência de preferências
- ✅ Preview em tempo real

### 🔍 **Filtros e Busca**
- ✅ Filtro por categoria de card
- ✅ Filtro por status de data
- ✅ Filtro por usuário atribuído
- ✅ Estatísticas visuais
- ✅ Contadores em tempo real

## 🛠️ Tecnologias Utilizadas

- **React 18+** - Framework principal
- **CSS3** - Estilização avançada
- **Vite** - Build tool moderna
- **Context API** - Gerenciamento de estado
- **LocalStorage** - Persistência local
- **HTML5 Drag & Drop** - Interações nativas

## 📁 Estrutura do Projeto

```
boardsync/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Card/              # Componente de card
│   │   ├── Column/            # Componente de coluna
│   │   ├── Header/            # Cabeçalho da aplicação
│   │   ├── Login/             # Tela de login
│   │   ├── Register/          # Tela de cadastro
│   │   ├── NewCardModal/      # Modal de criação
│   │   ├── EditableCard/      # Edição inline
│   │   ├── CategoryFilter/    # Filtros de categoria
│   │   ├── DueDateFilter/     # Filtros de data
│   │   ├── BlockCardModal/    # Modal de bloqueio
│   │   ├── LabelManager/      # Gerenciador de labels
│   │   ├── LabelSelector/     # Seletor de labels
│   │   ├── UserManager/       # Gerenciador de usuários
│   │   ├── UserSelector/      # Seletor de usuários
│   │   ├── DatePicker/        # Seletor de datas
│   │   └── ThemeSelector/     # Seletor de temas
│   ├── contexts/
│   │   └── ThemeContext.jsx   # Contexto de temas
│   ├── data/
│   │   └── initialData.js     # Dados e utilitários
│   ├── styles/
│   │   └── themes.css         # Variáveis de tema
│   ├── App.jsx               # Componente principal
│   ├── App.css               # Estilos globais
│   └── main.jsx              # Ponto de entrada
├── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/boardsync.git
cd boardsync
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o projeto:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:5173
```

## 🎯 Como Usar

### 1. **Primeiro Acesso**
- Acesse a aplicação
- Crie uma conta na tela de registro
- Faça login com suas credenciais

### 2. **Criando Cards**
- Clique em "+" em qualquer coluna
- Preencha título, descrição, prioridade
- Selecione categoria e tipo
- Atribua usuários e labels
- Defina data de vencimento (opcional)

### 3. **Gerenciando o Board**
- **Mover cards:** Arraste entre colunas
- **Editar:** Clique no card para edição inline
- **Filtrar:** Use os filtros superiores
- **Bloquear:** Use o botão de bloqueio nos cards

### 4. **Personalizando**
- **Usuários:** Botão "👥 Usuários" no header
- **Labels:** Botão "🏷️ Labels" no header  
- **Temas:** Botão "🎨 Temas" no header

## 📊 Funcionalidades Detalhadas

### **Cards Inteligentes**
- Indicadores de prioridade coloridos
- Status visual de prazos
- Avatars de usuários atribuídos
- Labels categorizadas
- Contador de subtarefas
- Indicação de bloqueios

### **Drag & Drop Avançado**
- Movimentação fluida
- Feedback visual durante arraste
- Subtarefas movem junto com pai
- Cards principais reagrupam subtarefas
- Prevenção de drops inválidos

### **Gestão de Prazos**
- Formatação inteligente ("Hoje", "Amanhã")
- Animações para urgência
- Filtros por status temporal
- Estatísticas de entregas

### **Sistema de Temas Completo**
- Troca instantânea de temas
- Variáveis CSS dinâmicas
- Modo escuro nativo
- Configurações granulares
- Persistência automática

## 🎨 Screenshots

### Tema Claro
![Tema Claro](docs/screenshots/light-theme.png)

### Tema Escuro
![Tema Escuro](docs/screenshots/dark-theme.png)

### Gestão de Usuários
![Usuários](docs/screenshots/user-management.png)

### Filtros Avançados
![Filtros](docs/screenshots/filters.png)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] **Backend Integration** - API REST
- [ ] **Real-time Updates** - WebSocket
- [ ] **Notifications** - Sistema de notificações
- [ ] **Comments** - Comentários nos cards
- [ ] **Attachments** - Upload de arquivos
- [ ] **Time Tracking** - Controle de tempo
- [ ] **Reports** - Relatórios e dashboards
- [ ] **Mobile App** - App React Native

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Desenvolvido com ❤️ por [Seu Nome]**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐