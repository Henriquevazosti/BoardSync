# 💾 Sistema de Exportação/Importação - BoardSync

Este documento descreve como usar o sistema de exportação e importação de dados do BoardSync.

## 📤 Funcionalidades Implementadas

### 1. Exportação de Dados
- **Localização**: Header → Botão "💾 Dados"
- **Função**: Exporta todos os dados do board para um arquivo JSON
- **Dados incluídos**:
  - ✅ Cards (incluindo subtarefas)
  - ✅ Colunas e sua ordem
  - ✅ Usuários
  - ✅ Labels
  - ✅ Histórico de atividades
  - ✅ Metadados (versão, data de exportação, usuário que exportou)

### 2. Importação de Dados
- **Métodos disponíveis**:
  - 📁 Upload de arquivo JSON
  - 📝 Colagem direta de dados JSON
- **Validações**:
  - ✅ Estrutura do JSON
  - ✅ Propriedades obrigatórias
  - ✅ Integridade dos dados
- **Segurança**: Substitui todos os dados atuais (com confirmação)

## 🚀 Como Usar

### Exportar Dados
1. Clique no botão "💾 Dados" no header
2. Na seção "📤 Exportar Dados", clique em "Exportar Dados do Board"
3. Um arquivo JSON será baixado automaticamente
4. O arquivo terá o nome: `boardsync-export-YYYY-MM-DD.json`

### Importar Dados
1. Clique no botão "💾 Dados" no header
2. Na seção "📥 Importar Dados":
   - **Opção 1**: Clique em "Selecionar arquivo JSON" e escolha um arquivo
   - **Opção 2**: Cole o conteúdo JSON diretamente na textarea
3. Clique em "Importar Dados"
4. Aguarde a confirmação de sucesso

## 📋 Formato do Arquivo

```json
{
  "version": "1.0.0",
  "exportDate": "2025-06-29T10:30:00.000Z",
  "exportedBy": "user-1",
  "data": {
    "users": { ... },
    "activities": { ... },
    "labels": { ... },
    "cards": { ... },
    "columns": { ... },
    "columnOrder": [ ... ]
  }
}
```

## ⚠️ Considerações Importantes

### Backup
- **Sempre faça backup** antes de importar novos dados
- A importação substitui **todos** os dados atuais
- Use a funcionalidade de exportação para criar backups regulares

### Compatibilidade
- O sistema inclui versionamento para compatibilidade futura
- Arquivos de versões futuras podem não ser compatíveis com versões anteriores
- Sempre use arquivos exportados da mesma versão ou anterior

### Segurança
- Os dados incluem todas as informações sensíveis do board
- Mantenha os arquivos de backup em local seguro
- Não compartilhe arquivos de exportação com pessoas não autorizadas

## 🔧 Recursos Técnicos

### Validações Implementadas
- Validação de estrutura JSON
- Verificação de propriedades obrigatórias:
  - `users` (objeto)
  - `cards` (objeto)
  - `columns` (objeto)
  - `columnOrder` (array)
- Validação de integridade das colunas
- Tratamento de propriedades opcionais (`activities`, `labels`)

### Registro de Atividades
- Importações são registradas no histórico
- Exportações são registradas no histórico
- Incluem timestamp e usuário responsável

### Tratamento de Erros
- Mensagens de erro específicas e em português
- Logs detalhados no console para debugging
- Interface clara para feedback ao usuário

## 💡 Casos de Uso

### 1. Backup Regular
```
1. Exportar dados semanalmente
2. Armazenar em local seguro
3. Manter múltiplas versões
```

### 2. Migração de Ambiente
```
1. Exportar dados do ambiente atual
2. Configurar novo ambiente
3. Importar dados no novo ambiente
```

### 3. Compartilhamento de Board
```
1. Exportar dados do board
2. Compartilhar arquivo com equipe
3. Equipe importa no seu ambiente
```

### 4. Restauração após Problema
```
1. Identificar último backup válido
2. Importar dados do backup
3. Verificar integridade dos dados
```

## 🛠️ Troubleshooting

### Erro: "Formato de dados inválido"
- Verifique se o arquivo é um JSON válido
- Confirme se o arquivo foi exportado do BoardSync
- Tente exportar novamente se o arquivo estiver corrompido

### Erro: "Propriedade não encontrada"
- O arquivo pode estar incompleto
- Verifique se todas as seções estão presentes
- Use um arquivo de backup mais recente

### Importação não funciona
- Verifique o tamanho do arquivo (muito grande pode causar problemas)
- Tente colar o conteúdo diretamente na textarea
- Verifique se há caracteres especiais que podem estar causando problemas

## 📞 Suporte

Para problemas com exportação/importação:
1. Verifique o console do navegador para erros detalhados
2. Tente com um arquivo de exportação recente
3. Confirme se a estrutura do JSON está correta
4. Em caso de dúvidas, exporte um board novo para comparação

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2025  
**Compatibilidade**: BoardSync v1.0+
