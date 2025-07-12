# 📋 BoardSync API - Collection Postman

Esta collection contém todos os endpoints da API BoardSync testados e validados. Inclui exemplos completos de requisições, scripts de teste automatizados e configuração de variáveis.

## 🚀 Como usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import** 
3. Importe os arquivos:
   - `BoardSync-API-Collection.postman_collection.json`
   - `BoardSync-API-Environment.postman_environment.json`

### 2. Configurar Ambiente

1. No Postman, selecione o ambiente **"BoardSync API - Local Environment"**
2. Verifique se a variável `base_url` está configurada para `http://localhost:3001/api/v1`

### 3. Iniciar o Servidor

Antes de usar a collection, certifique-se de que o servidor está rodando:

```bash
cd api
$env:DB_TYPE = "sqlite"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
node src/server.js
```

### 4. Usar a Collection

#### Fluxo Recomendado:

1. **🔐 Autenticação → Login**
   - Execute primeiro para obter o token JWT
   - O token será automaticamente salvo nas variáveis de ambiente

2. **🏢 Workspaces → Listar Workspaces**
   - Lista seus workspaces
   - Automaticamente salva um workspace_id válido

3. **📋 Boards → Listar Boards do Workspace**
   - Lista boards do workspace selecionado
   - Salva board_id automaticamente

4. **📝 Lists → Listar Listas do Board**
   - Lista listas do board selecionado
   - Salva list_id automaticamente

5. **🎯 Cards → Listar Cards da Lista**
   - Lista cards da lista selecionada
   - Salva card_id automaticamente

6. **🏷️ Labels → Listar Labels do Board**
   - Lista labels do board
   - Salva label_id automaticamente

7. **💬 Comments → Listar Comentários do Card**
   - Lista comentários do card
   - Salva comment_id automaticamente

## 📋 Endpoints Inclusos

### 🔐 Autenticação
- `POST /auth/login` - Fazer login
- `POST /auth/logout` - Fazer logout

### 🏢 Workspaces  
- `GET /workspaces` - Listar workspaces
- `POST /workspaces` - Criar workspace

### 📋 Boards
- `GET /boards/workspace/{workspaceId}` - Listar boards
- `POST /boards/workspace/{workspaceId}` - Criar board
- `GET /boards/{id}` - Buscar board
- `PUT /boards/{id}` - Atualizar board
- `DELETE /boards/{id}` - Deletar board

### 📝 Lists
- `GET /lists/board/{boardId}` - Listar listas
- `POST /lists/board/{boardId}` - Criar lista
- `GET /lists/{id}` - Buscar lista
- `PUT /lists/{id}` - Atualizar lista
- `DELETE /lists/{id}` - Deletar lista

### 🎯 Cards
- `GET /cards/list/{listId}` - Listar cards
- `POST /cards/list/{listId}` - Criar card
- `GET /cards/{id}` - Buscar card
- `PUT /cards/{id}` - Atualizar card
- `POST /cards/{id}/move` - Mover card
- `DELETE /cards/{id}` - Deletar card

### 🏷️ Labels
- `GET /labels/board/{boardId}` - Listar labels
- `POST /labels/board/{boardId}` - Criar label
- `GET /labels/{id}` - Buscar label
- `PUT /labels/{id}` - Atualizar label
- `DELETE /labels/{id}` - Deletar label

### 💬 Comments
- `GET /comments/card/{cardId}` - Listar comentários
- `POST /comments/card/{cardId}` - Criar comentário
- `GET /comments/{id}` - Buscar comentário
- `PUT /comments/{id}` - Atualizar comentário
- `DELETE /comments/{id}` - Deletar comentário

### 📊 Extras
- `GET /` - Documentação da API
- `GET /health` - Status da API

## 🔧 Funcionalidades Especiais

### Scripts Automatizados
- **Auto-save de tokens**: O token JWT é automaticamente salvo após login
- **Auto-save de IDs**: IDs de recursos são automaticamente salvos para uso posterior
- **Testes automatizados**: Cada requisição inclui testes para validar respostas

### Validações Incluídas
- ✅ Prioridades de cards: `baixa`, `media`, `alta`
- ✅ Categorias de cards: `tarefa`, `bug`, `melhoria`
- ✅ Validação de GUIDs para workspaces
- ✅ Autenticação automática com Bearer Token

### Dados de Exemplo
Todos os endpoints incluem dados de exemplo prontos para uso:
- Cores em hexadecimal
- Datas no formato ISO
- Prioridades e categorias válidas
- Textos descritivos

## 🎯 Dicas de Uso

1. **Sempre execute o Login primeiro** para obter o token
2. **Siga a sequência lógica**: Workspace → Board → List → Card → Comment
3. **Use os scripts de teste** para validar as respostas
4. **As variáveis são atualizadas automaticamente** - não precisa copiar IDs manualmente
5. **Para testes de criação/atualização**, modifique os dados nos bodies das requisições

## 🔒 Autenticação

A collection está configurada para usar **Bearer Token** automaticamente. Após o login, todas as requisições incluirão o header:
```
Authorization: Bearer {{auth_token}}
```

## 📝 Usuário de Teste

Por padrão, a collection usa o usuário de teste:
- **Email**: `henrique.vazosti@gmail.com`  
- **Senha**: `123456`

## 🚀 Status da API

Todos os endpoints foram testados e validados:
- ✅ Autenticação funcional
- ✅ CRUD completo para todos os recursos
- ✅ Validações de dados
- ✅ Controle de acesso
- ✅ Rate limiting ativo
- ✅ Logs estruturados

---

**🎉 API BoardSync - Integração Completa e Funcional!**
