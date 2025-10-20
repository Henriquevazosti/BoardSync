# 🚀 Guia de Configuração do BoardSync Backend

## Opções de Configuração

### 🐳 Opção 1: Docker (Recomendado)
**Mais fácil e rápido para desenvolvimento**

1. **Instalar Docker Desktop:**
   - Baixe em: https://www.docker.com/products/docker-desktop/
   - Siga o processo de instalação
   - Reinicie o computador se necessário

2. **Configurar com Docker:**
   ```bash
   npm run docker:setup
   ```

3. **Comandos úteis:**
   ```bash
   npm run docker:up     # Iniciar containers
   npm run docker:down   # Parar containers  
   npm run docker:logs   # Ver logs
   ```

### 🗄️ Opção 2: PostgreSQL Local
**Para quem prefere instalação tradicional**

1. **Instalar PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Durante a instalação, anote o usuário e senha

2. **Configurar banco:**
   ```bash
   npm run db:setup
   ```

3. **Iniciar API:**
   ```bash
   npm start
   ```

### 🔧 Opção 3: SQLite (Desenvolvimento)
**Para testes rápidos sem instalações**

1. **Usar configuração SQLite:**
   ```bash
   npm run setup:sqlite
   ```

2. **Iniciar API:**
   ```bash
   npm run dev:sqlite
   ```

## 🧪 Testar a API

Após configurar, teste se tudo funciona:

```bash
npm run test:api
```

## 📁 Estrutura Criada

```
api/
├── .env                 # Configurações do ambiente
├── logs/               # Logs da aplicação
├── uploads/            # Arquivos enviados
├── database/           # Schema e migrations
├── docker-compose.yml  # Configuração Docker
└── ...
```

## 🔧 Variáveis de Ambiente

Edite o arquivo `.env` conforme necessário:

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boardsync
DB_USER=boardsync_user
DB_PASSWORD=boardsync_pass
JWT_SECRET=change_this_in_production
SESSION_SECRET=change_this_too
```

## 🚨 Solução de Problemas

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac  
lsof -i :3001
kill -9 <PID>
```

### Resetar Docker
```bash
docker-compose down -v
docker-compose up -d --build
```

### Resetar banco local
```bash
dropdb boardsync
npm run db:setup
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `npm run docker:logs` ou `cat logs/error.log`
2. Teste a conectividade: `npm run test:api`
3. Consulte a documentação da API: http://localhost:3001/api/docs
