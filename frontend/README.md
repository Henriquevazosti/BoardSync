# 📋 BoardSync

Um sistema completo de gerenciamento de projetos estilo Kanban, inspirado no Trello e Jira, desenvolvido com React no frontend e Node.js no backend.

![BoardSync](https://img.shields.io/badge/React-18+-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Status](https://img.shields.io/badge/Status-Produção-success.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Como rodar o frontend

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```

O frontend estará disponível em http://localhost:3000

## Estrutura de pastas
- `src/` — código-fonte React
- `public/` — arquivos estáticos
- `services/` — integração com API
- `components/` — componentes reutilizáveis
- `contexts/` — contextos globais
- `hooks/` — hooks customizados
- `utils/` — utilitários

---

## 🚀 Funcionalidades

### 🔐 **Sistema de Autenticação**
- ✅ Login e registro de usuários
- ✅ Autenticação JWT
- ✅ Proteção de rotas
- ✅ Sessão persistente

### 📋 **Quadro Kanban Avançado**
- ✅ Drag & Drop nativo entre colunas
- ✅ Sistema de categorias completo:
  - 📖 **Criação** - Funcionalidades do usuário
  - 🎯 **Troca** - Grandes iniciativas
  - ❌ **Erro** - Correções necessárias
  - ⚡ **Full** - Tarefas gerais
  - 🔧 **Subtarefas** - Erro no pedido, Estorno, Atividade Complementar
- ✅ Filtros visuais por tipo
- ✅ Hierarquia pai-filho para subtarefas

### 👥 **Gestão de Usuários**
- ✅ Sistema completo de usuários
- ✅ Atribuição de cards a pessoas
- ✅ Avatars personalizados
- ✅ Cores customizáveis por usuário
- ✅ Gerenciamento CRUD de usuários

### 🏷️ **Sistema de Labels para E-commerce**
- ✅ Labels especializadas para transportadoras:
  - 📦 Correios
  - 🛒 Mercado Livre
  - 🛍️ Shopee
  - 🏪 Americanas
  - 💊 FisioSmart
  - 🌟 Temu
  - 🏬 Magazine Luiza
- ✅ Logos e cores personalizadas
- ✅ Aplicação múltipla nos cards

### 📅 **Datas e Prazos**
- ✅ Datas de vencimento nos cards
- ✅ Indicadores visuais inteligentes:
  - 🟢 **Normal** - Prazo tranquilo
  - 🔵 **Vence em breve** - Próximos 3 dias
  - 🟡 **Vence hoje** - Urgente (com animação)
  - 🔴 **Vencido** - Atrasado (com animação)
- ✅ Filtros por status de prazo

### 🎯 **Recursos Avançados**
- ✅ **Prioridades**: Baixa, Média, Alta (com cores)
- ✅ **Bloqueio de cards** com motivos
- ✅ **Histórico de atividades** completo
- ✅ **Comentários** nos cards
- ✅ **Upload de anexos** (imagens, documentos)
- ✅ **Sistema de busca** por título/descrição
- ✅ **Temas** claro e escuro
- ✅ **Exportação/Importação** de dados JSON

### 💾 **Sistema de Dados**
- ✅ **Exportação completa** de boards em JSON
- ✅ **Importação segura** com validação
- ✅ **Backup automático** dos dados
- ✅ **Estrutura versionada** para compatibilidade

## 🏗️ Arquitetura

### Frontend (React + Vite)
```
src/
├── components/           # Componentes React
│   ├── Card/            # Cards do Kanban
│   ├── Column/          # Colunas do board
│   ├── Header/          # Cabeçalho da aplicação
│   ├── Login/           # Sistema de autenticação
│   ├── LabelManager/    # Gerenciamento de labels
│   ├── UserManager/     # Gerenciamento de usuários
│   └── ...              # Outros componentes
├── contexts/            # Contextos React (Tema, Auth)
├── data/               # Dados iniciais e configurações
├── services/           # Serviços de API
├── styles/             # Estilos CSS e temas
└── utils/              # Utilitários e helpers
```

### Backend (Node.js + Express)
```
api/
├── src/
│   ├── server.js        # Servidor principal
│   ├── config/          # Configurações (DB, JWT)
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── routes/          # Rotas da API REST
│   └── database/        # Migrations e schemas
├── database/            # Banco SQLite
└── uploads/             # Arquivos enviados
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 🏁 Subindo o ambiente completo (Backend + Frontend)

#### 1. Subir o Backend (API)

```powershell
cd api
npm install
npm run dev:sqlite
```

O backend estará disponível em: http://localhost:3001

#### 2. Subir o Frontend (React)

Abra um novo terminal, volte para a raiz do projeto:

```powershell
cd ..
npm install
npm run dev
```

O frontend estará disponível em: http://localhost:3000

### 📝 Dica rápida
- Sempre rode `npm install` na primeira vez ou após atualizar dependências.
- O comando `npm run dev:sqlite` já prepara o banco SQLite automaticamente.
- Para resetar o banco, apague o arquivo `api/database/boardsync.db` e rode novamente.

### 🐳 Opção Docker (Alternativa)

1. **Instalar Docker Desktop:**
   - Baixe em: https://www.docker.com/products/docker-desktop/

2. **Executar com Docker:**
   ```bash
   cd api
   npm run docker:setup
   npm run docker:up
   ```

## 🎯 Como Usar

### 1. **Primeiro Acesso**
- Acesse a aplicação em http://localhost:3000
- Crie uma conta na tela de registro
- Faça login com suas credenciais

### 2. **Criando Cards**
- Clique em "Adicionar um cartão" em qualquer coluna
- Preencha título, descrição, prioridade
- Selecione categoria e tipo
- Atribua usuários e labels de transportadoras
- Defina data de vencimento (opcional)
- Anexe arquivos se necessário

### 3. **Gerenciando o Board**
- **Mover cards:** Arraste entre colunas
- **Editar:** Clique no card para abrir detalhes
- **Filtrar:** Use os filtros superiores por categoria e prazo
- **Bloquear:** Use o botão de bloqueio nos cards

### 4. **Personalizando**
- **Usuários:** Botão "👥 Dados" > "Usuários" no header
- **Labels:** Botão "🏷️" no modal de criação de cards
- **Temas:** Botão "🎨 Temas" no header
- **Dados:** Exportar/Importar via botão "💾 Dados"

## 📊 Funcionalidades Detalhadas

### **Cards Inteligentes**
- Indicadores de prioridade coloridos
- Status visual de prazos com animações
- Avatars de usuários atribuídos
- Labels de transportadoras com logos
- Contador de comentários e anexos
- Indicação de bloqueios com motivos

### **Drag & Drop Avançado**
- Movimentação fluida entre colunas
- Feedback visual durante arraste
- Validação de movimentos permitidos
- Atualização automática de status

### **Sistema de Exportação/Importação**
- **Exportação**: Gera arquivo JSON completo com todos os dados
- **Importação**: Aceita upload de arquivo ou colagem de JSON
- **Validação**: Verifica integridade e estrutura dos dados
- **Backup**: Preserva dados existentes antes da importação

## 🛠️ API e Desenvolvimento

### Endpoints Principais
```
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/register       # Registro
GET    /api/v1/workspaces          # Listar workspaces
GET    /api/v1/boards/:id          # Obter board
POST   /api/v1/cards               # Criar card
PUT    /api/v1/cards/:id           # Atualizar card
```

### Testando a API
Use a collection Postman incluída:
- `api/BoardSync-API-Collection.postman_collection.json`
- `api/BoardSync-API-Environment.postman_environment.json`

### Banco de Dados
- **Desenvolvimento**: SQLite (automático)
- **Produção**: PostgreSQL (configurável)
- **Schema**: Totalmente documentado em `api/database/schema.sql`

## 🔧 Configuração Avançada

### Variáveis de Ambiente (Backend)
```bash
# api/.env
DB_TYPE=sqlite                    # ou postgresql
JWT_SECRET=sua-chave-secreta
PORT=3001
DATABASE_URL=sqlite:./database/boardsync.db
```

### Scripts Disponíveis
```bash
# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Backend
npm run dev          # Desenvolvimento com nodemon
npm run dev:sqlite   # Desenvolvimento com SQLite
npm start            # Produção
npm run db:setup     # Configurar banco
```

## 🎨 Temas e Personalização

O sistema inclui temas completos:
- **Tema Claro**: Interface limpa e moderna
- **Tema Escuro**: Reduz fadiga visual
- **Cores Personalizáveis**: Variáveis CSS para fácil customização

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] **Notificações em tempo real** - WebSocket
- [ ] **Time Tracking** - Controle de tempo nas tarefas
- [ ] **Reports** - Relatórios e dashboards
- [ ] **Mobile App** - App React Native
- [ ] **Integrações** - Slack, Discord, Email
- [ ] **Templates** - Boards pré-configurados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Desenvolvido com ❤️ por Henrique Vazosti**

- GitHub: [@Henriquevazosti](https://github.com/Henriquevazosti)
- Email: henrique.vazosti@gmail.com

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐

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