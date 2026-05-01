FROM node:18-alpine

# Instalar FFmpeg e outras dependências
RUN apk add --no-cache ffmpeg curl

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs data temp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${WEBHOOK_PORT:-3000}/health || exit 1

# Informações de metadados
LABEL maintainer="seu-email@example.com"
LABEL description="Advanced Telegram bot for video download, audio extraction, reminders and more"
LABEL version="1.0.0"

# Start bot
CMD ["node", "src/index.js"]
