m# 🤖 Puxa Vídeos Bot - Bot Avançado para Telegram
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#licença)
[![Status](https://img.shields.io/badge/Status-Ativo-brightgreen)](#)

Um bot multifuncional para Telegram com arquitetura modular, altamente escalável e pronto para produção. Segue princípios de **Clean Code**, **SOLID** e separação de responsabilidades.

---

## 📋 Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Arquitetura](#arquitetura)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## ✨ Características

### 🎬 Download de Vídeos
- Suporte para **TikTok**, **Instagram**, **YouTube** e **Twitter/X**
- Detecção automática de plataforma
- Remoção de marca d'água quando possível
- Retry automático com backoff exponencial

### 🎵 Extração de Áudio
- Extrai áudio de qualquer vídeo
- Conversão automática para MP3
- Normalização de bitrate (128kbps default)
- Limpeza automática de arquivos temporários

### ⏰ Sistema de Lembretes
- Lembretes com precisão (±1s)
- Suporte para: segundos (s), minutos (m) e horas (h)
- Persistência em arquivo JSON
- Notificações em tempo real

### 🧹 Gerenciamento de Chats
- Limpeza de mensagens (admin only)
- Ban/Unban de usuários
- Controle de permissões
- Validação de autoridades

### 📅 Utilidades
- Informação de data/hora (timezone configurável)
- Status do bot em tempo real
- Consumo de memória
- Uptime e recursos

---

## 📦 Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **FFmpeg** (para extração de áudio)
- Conta no Telegram + Token de Bot

### Instalação de Dependências de Sistema

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

#### Windows
- Download: https://ffmpeg.org/download.html
- Ou use: `choco install ffmpeg`

---

## 🚀 Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/puxa-videos-bot.git
cd puxa-videos-bot
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
nano .env  # ou use seu editor favorito
```

### 4. Obter Token do Bot Telegram
1. Abra [@BotFather](https://t.me/botfather) no Telegram
2. Digite `/newbot`
3. Siga as instruções
4. Copie o token fornecido

---

## ⚙️ Configuração

### Arquivo `.env`

```env
# ========== BOT ==========
BOT_TOKEN=seu_token_aqui
WEBHOOK_URL=https://seu-dominio.com/webhook
WEBHOOK_PORT=3000

# ========== ADMIN ==========
ADMIN_IDS=123456789,987654321
BLACKLIST_USERS=111111111,222222222

# ========== RATE LIMITING ==========
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=10000
RATE_LIMIT_MAX_REQUESTS=5

# ========== INTEGRATIONS ==========
ENABLE_TIKTOK=true
ENABLE_INSTAGRAM=true
ENABLE_YOUTUBE=true
ENABLE_TWITTER=true

# ========== TIMEZONE ==========
TIMEZONE=America/Sao_Paulo

# ========== LOGGING ==========
LOG_LEVEL=info
LOG_FILE=./logs/bot.log

# ========== ENVIRONMENT ==========
NODE_ENV=development
```

### Encontrar seu User ID
No Telegram, envie `/start` para [@userinfobot](https://t.me/userinfobot) para obter seu ID.

---

## 📱 Uso

### Iniciar o Bot

#### Desenvolvimento (Polling)
```bash
npm run dev
```

#### Produção (Webhook)
```bash
npm start
```

### Comandos Disponíveis

#### 🎬 Mídia
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/video <url>` | Baixar vídeo | `/video https://tiktok.com/v/123456` |
| `/audio <url>` | Extrair áudio | `/audio https://youtube.com/watch?v=dQw4` |

#### ⏰ Lembretes
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/remind <tempo> <msg>` | Criar lembrete | `/remind 10m Estudar matemática` |
| `/reminders` | Listar lembretes | `/reminders` |
| `/cancel <id>` | Cancelar lembrete | `/cancel reminder_123456` |

#### 🧹 Chat (Admin)
| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/clear <n>` | Deletar N mensagens | `/clear 10` |
| `/ban` | Banir usuário (responder) | Responda a uma mensagem + `/ban` |
| `/unban <id>` | Desbanir usuário | `/unban 123456789` |

#### 📅 Utilidades
| Comando | Descrição |
|---------|-----------|
| `/date` | Ver data/hora atual |
| `/status` | Status do bot |
| `/help` | Lista de comandos |
| `/start` | Mensagem de boas-vindas |

### Exemplos de Uso

**Download de Vídeo TikTok:**
```
/video https://www.tiktok.com/@usuario/video/1234567890
```

**Criar Lembrete:**
```
/remind 2h Reunião às 14h
```

**Extrair Áudio do YouTube:**
```
/audio https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 🏗️ Arquitetura

### Estrutura de Diretórios
```
src/
├── controllers/        # Entrada dos comandos
│   ├── videoController.js
│   ├── audioController.js
│   ├── reminderController.js
│   ├── chatController.js
│   └── utilityController.js
├── services/          # Lógica de negócio
│   ├── videoService.js
│   ├── audioService.js
│   └── reminderService.js
├── repositories/      # Persistência de dados
│   └── remindersRepository.js
├── middlewares/       # Autenticação e rate limit
│   ├── auth.js
│   └── rateLimit.js
├── jobs/              # Tarefas assíncronas
│   └── reminderScheduler.js
├── utils/             # Helpers e utilitários
│   ├── logger.js
│   ├── constants.js
│   └── helpers.js
├── config.js          # Configuração centralizada
├── bot.js             # Inicialização do bot
└── index.js           # Ponto de entrada
```

### Padrões de Arquitetura

**Camadas:**
- **Controllers** → Recebem comandos e coordenam
- **Services** → Implementam lógica de negócio
- **Repositories** → Acessam dados (JSON, DB)
- **Middlewares** → Tratam autenticação e rate limit
- **Utils** → Funções auxiliares reutilizáveis

**Princípios:**
- ✅ Separação de responsabilidades
- ✅ Injeção de dependências
- ✅ Async/await em operações I/O
- ✅ Logs estruturados
- ✅ Tratamento robusto de erros
- ✅ Retry com backoff exponencial

---

## 🔄 Fluxo de Execução

### Download de Vídeo
```
1. Usuário envia: /video <url>
2. Controller valida URL
3. Service detecta plataforma
4. Service faz download com retry
5. Bot envia arquivo ao usuário
6. Cleanup de arquivo temporário
```

### Criar Lembrete
```
1. Usuário envia: /remind 10m Mensagem
2. Controller valida argumento
3. Service calcula tempo-alvo
4. Repository armazena em JSON
5. Scheduler monitora periodicamente
6. Scheduler notifica quando time expire
```

---

## 🔐 Segurança

### Autenticação
- Whitelist de Admin IDs
- Blacklist de usuários bloqueados
- Validação de permissões por comando

### Rate Limiting
- Limite de 5 comandos por 10 segundos (default)
- Counter por usuário em memória
- Limpeza automática de entradas expiradas

### Validação
- URLs validadas com `new URL()`
- Detecção de plataforma por regex
- Limites de tamanho de arquivo enforçados

---

## 📊 Logging

O bot mantém logs estruturados em múltiplos níveis:

```javascript
logger.info('Ação completada', { userId, data });
logger.warn('Aviso importante', { issue });
logger.error('Erro ocorreu', error);
logger.debug('Informação detalhada', { metadata });
```

**Arquivos de Log:**
- `logs/bot.log` - Todos os logs
- `logs/error.log` - Apenas erros
- Rotação automática: 10MB por arquivo, máx 5 arquivos

---

## 🐛 Troubleshooting

### "BOT_TOKEN is not configured"
**Solução:** Crie arquivo `.env` e configure `BOT_TOKEN`
```bash
cp .env.example .env
echo "BOT_TOKEN=seu_token" >> .env
```

### "FFmpeg not available"
**Solução:** Instale FFmpeg no sistema
```bash
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg          # macOS
choco install ffmpeg         # Windows
```

### "Download failed"
**Possíveis causas:**
- URL inválida ou plataforma não suportada
- Timeout (padrão 30s, ajustável em `.env`)
- API externa indisponível
- Arquivo muito grande (>50MB default)

**Solução:**
```env
DOWNLOAD_TIMEOUT_MS=60000  # Aumentar timeout
MAX_FILE_SIZE_MB=100       # Aumentar limite
```

### "Rate limit exceeded"
**Solução:** Aguarde alguns segundos ou ajuste em `.env`
```env
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=15000
```

### Bot parado em modo polling
**Motivo:** Telegram pode haver desconectado
**Solução:** Reiniciar com hot-reload
```bash
npm run dev  # Usa nodemon para restart automático
```

---

## 📈 Performance

### Otimizações
- ✅ Async/await em todas operações I/O
- ✅ Retry inteligente com backoff exponencial
- ✅ Pool de conexões reutilizáveis
- ✅ Cleanup automático de arquivos temp
- ✅ Rate limiting por usuário
- ✅ Agendador eficiente de lembretes

### Benchmarks (Esperados)
- **Download 10MB:** ~5-10s (depende da rede)
- **Extração de áudio:** ~15-30s (depende da duração)
- **Criar lembrete:** <100ms
- **Memória base:** ~150MB

---

## 🚀 Deploy

### Método 1: VPS (Ubuntu/Debian)
```bash
# 1. SSH no servidor
ssh user@seu_vps.com

# 2. Clonar repo
git clone seu_repo
cd pulxa-videos-bot

# 3. Instalar Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg

# 4. Instalar dependências
npm install --production

# 5. Configurar .env
nano .env

# 6. Usar PM2 para manter rodando
npm install -g pm2
pm2 start src/index.js --name "bot"
pm2 startup
pm2 save
```

### Método 2: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar FFmpeg
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
```

```bash
docker build -t puxa-bot .
docker run -e BOT_TOKEN=seu_token puxa-bot
```

### Método 3: Vercel (Webhook)
```bash
npm install -g vercel
vercel
# Seguir instruções
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

- 
- **Email:**  duzx22@gmail.com 

---

n## 🙏 Agradecimentos

- [Telegraf](https://telegraf.js.org/) - Framework Telegram
- [Winston](https://github.com/winstonjs/winston) - Logging
- [FFmpeg](https://ffmpeg.org/) - Processamento de mídia

---

**⭐ Se este projeto foi útil, deixe uma star!**
