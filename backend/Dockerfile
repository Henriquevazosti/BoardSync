FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema para compilação
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs uploads

# Expor porta
EXPOSE 3001

# Comando padrão
CMD ["npm", "start"]
