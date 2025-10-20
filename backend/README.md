# BoardSync API# BoardSync API



API REST para o sistema BoardSync. Documentação completa disponível no [README principal](../README.md).API REST para o sistema BoardSync. Documentação completa disponível no [README principal](../README.md).



## 🚀 Início Rápido## 🚀 Início Rápido



```bash```bash

# Instalar dependências# Instalar dependências

npm installnpm install



# Executar com SQLite (desenvolvimento)# Executar com SQLite (desenvolvimento)

npm run dev:sqlitenpm run dev:sqlite



# Executar com PostgreSQL# Executar com PostgreSQL

npm run devnpm run dev

``````



## 📋 Endpoints Principais## 📋 Endpoints Principais



``````

POST   /api/v1/auth/login          # LoginPOST   /api/v1/auth/login          # Login

POST   /api/v1/auth/register       # Registro  POST   /api/v1/auth/register       # Registro  

GET    /api/v1/workspaces          # Listar workspacesGET    /api/v1/workspaces          # Listar workspaces

GET    /api/v1/boards/:id          # Obter boardGET    /api/v1/boards/:id          # Obter board

POST   /api/v1/cards               # Criar cardPOST   /api/v1/cards               # Criar card

PUT    /api/v1/cards/:id           # Atualizar cardPUT    /api/v1/cards/:id           # Atualizar card

``````



## 🧪 Testes## 🧪 Testes



Use a collection Postman incluída:Use a collection Postman incluída:

- `BoardSync-API-Collection.postman_collection.json`- `BoardSync-API-Collection.postman_collection.json`

- `BoardSync-API-Environment.postman_environment.json`- `BoardSync-API-Environment.postman_environment.json`



## ⚙️ Configuração## ⚙️ Configuração



Veja o arquivo [SETUP.md](SETUP.md) para opções de configuração detalhadas.Veja o arquivo [SETUP.md](SETUP.md) para opções de configuração detalhadas.



------



Para documentação completa, consulte o [README principal](../README.md).Para documentação completa, consulte o [README principal](../README.md).
- [WebSocket](#websocket)
- [Tratamento de Erros](#tratamento-de-erros)

## 🚀 Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para cache)

### Instalação

1. Instalar dependências:
```bash
cd api
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Configurar banco de dados:
```bash
npm run db:setup
```

4. Iniciar servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### Variáveis de Ambiente

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boardsync
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000
```

## 🔐 Autenticação

A API utiliza autenticação JWT (JSON Web Tokens). Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <token>
```

### Obter Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "member"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📚 Endpoints

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/v1/auth/register` | Registrar usuário | ❌ |
| POST | `/api/v1/auth/login` | Login | ❌ |
| GET | `/api/v1/auth/verify` | Verificar token | ✅ |
| POST | `/api/v1/auth/logout` | Logout | ✅ |
| POST | `/api/v1/auth/forgot-password` | Esqueceu senha | ❌ |
| POST | `/api/v1/auth/reset-password` | Redefinir senha | ❌ |

### Workspaces

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/v1/workspaces` | Listar workspaces | ✅ |
| GET | `/api/v1/workspaces/:id` | Buscar workspace | ✅ |
| POST | `/api/v1/workspaces` | Criar workspace | ✅ |
| PUT | `/api/v1/workspaces/:id` | Atualizar workspace | ✅ |
| DELETE | `/api/v1/workspaces/:id` | Deletar workspace | ✅ |
| POST | `/api/v1/workspaces/:id/members` | Adicionar membro | ✅ |
| DELETE | `/api/v1/workspaces/:id/members/:userId` | Remover membro | ✅ |

### Boards

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/v1/boards/workspace/:workspaceId` | Listar boards | ✅ |
| GET | `/api/v1/boards/:id` | Buscar board completo | ✅ |
| POST | `/api/v1/boards/workspace/:workspaceId` | Criar board | ✅ |
| PUT | `/api/v1/boards/:id` | Atualizar board | ✅ |
| DELETE | `/api/v1/boards/:id` | Deletar board | ✅ |

### Cards

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/v1/cards/list/:listId` | Listar cards | ✅ |
| GET | `/api/v1/cards/:id` | Buscar card completo | ✅ |
| POST | `/api/v1/cards/list/:listId` | Criar card | ✅ |
| PUT | `/api/v1/cards/:id` | Atualizar card | ✅ |
| POST | `/api/v1/cards/:id/move` | Mover card | ✅ |
| POST | `/api/v1/cards/:id/assign` | Atribuir usuários | ✅ |
| DELETE | `/api/v1/cards/:id` | Deletar card | ✅ |

### Uploads

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/v1/upload/image` | Upload de imagem | ✅ |
| POST | `/api/v1/upload/file` | Upload de arquivo | ✅ |

## 📊 Modelos de Dados

### Workspace

```json
{
  "id": "uuid",
  "name": "Nome do Workspace",
  "description": "Descrição opcional",
  "color": "#0052cc",
  "visibility": "private",
  "created_by": "uuid",
  "created_at": "2025-07-11T10:00:00Z",
  "updated_at": "2025-07-11T10:00:00Z"
}
```

### Board

```json
{
  "id": "uuid",
  "workspace_id": "uuid",
  "name": "Nome do Board",
  "description": "Descrição opcional",
  "background_color": "#ffffff",
  "background_image": "url_da_imagem",
  "created_by": "uuid",
  "created_at": "2025-07-11T10:00:00Z",
  "updated_at": "2025-07-11T10:00:00Z",
  "lists": [
    {
      "id": "uuid",
      "name": "Nome da Lista",
      "position": 1,
      "cards": [...]
    }
  ]
}
```

### Card

```json
{
  "id": "uuid",
  "list_id": "uuid",
  "title": "Título do Card",
  "description": "Descrição do card",
  "position": 1,
  "priority": "media",
  "category": "tarefa",
  "is_blocked": false,
  "block_reason": "",
  "due_date": "2025-07-20T23:59:59Z",
  "start_date": "2025-07-11T08:00:00Z",
  "estimated_hours": 8.5,
  "actual_hours": 6.0,
  "created_by": "uuid",
  "completed_at": null,
  "created_at": "2025-07-11T10:00:00Z",
  "updated_at": "2025-07-11T10:00:00Z",
  "assignees": [
    {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "avatar": "👤"
    }
  ],
  "labels": [
    {
      "id": "uuid",
      "name": "Frontend",
      "color": "#0052cc",
      "bg_color": "#e6f3ff"
    }
  ],
  "comment_count": 3,
  "attachment_count": 1,
  "subtask_count": 0
}
```

## 🔄 WebSocket

A API suporta comunicação em tempo real via Socket.IO.

### Conexão

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'seu_jwt_token'
  }
});
```

### Eventos

#### Entrar em salas

```javascript
// Entrar em workspace
socket.emit('join-workspace', 'workspace-id');

// Entrar em board
socket.emit('join-board', 'board-id');
```

#### Eventos de cards

```javascript
// Card movido
socket.emit('card-moved', {
  cardId: 'card-id',
  boardId: 'board-id',
  oldListId: 'old-list-id',
  newListId: 'new-list-id',
  position: 2
});

// Escutar movimentações
socket.on('card-moved', (data) => {
  console.log('Card movido:', data);
});

// Card atualizado
socket.on('card-updated', (data) => {
  console.log('Card atualizado:', data);
});
```

#### Chat em tempo real

```javascript
// Enviar mensagem
socket.emit('chat-message', {
  workspaceId: 'workspace-id',
  message: 'Olá equipe!',
  userId: 'user-id'
});

// Receber mensagens
socket.on('chat-message', (data) => {
  console.log('Nova mensagem:', data);
});
```

## ⚠️ Tratamento de Erros

A API retorna erros em formato JSON consistente:

```json
{
  "error": "Mensagem de erro legível",
  "details": [
    {
      "field": "email",
      "message": "Email deve ser válido"
    }
  ]
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Permissão negada
- `404` - Não encontrado
- `409` - Conflito (dados duplicados)
- `429` - Muitas requisições
- `500` - Erro interno do servidor

### Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Limite**: 100 requisições por IP a cada 15 minutos
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## 📝 Logs

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

Níveis de log disponíveis:
- `error` - Apenas erros
- `warn` - Avisos e erros
- `info` - Informações, avisos e erros (padrão)
- `debug` - Todos os logs

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em watch mode
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📈 Monitoramento

### Health Check

```http
GET /health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-11T10:00:00Z",
  "version": "v1"
}
```

### Métricas

- **Uptime**: Tempo de funcionamento do servidor
- **Memory**: Uso de memória
- **Database**: Status da conexão com banco
- **Redis**: Status do cache (se configurado)

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
api/
├── src/
│   ├── config/         # Configurações
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   ├── routes/         # Rotas
│   └── server.js       # Servidor principal
├── logs/               # Arquivos de log
├── uploads/            # Arquivos enviados
├── package.json
└── README.md
```

### Scripts Disponíveis

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "jest",
  "migrate": "knex migrate:latest",
  "seed": "knex seed:run",
  "db:setup": "node setup-database.js"
}
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
