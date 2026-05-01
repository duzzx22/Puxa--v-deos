# 🤖 Puxa Vídeos Bot - Bot Avançado para Telegram
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#licença)

Um bot modular para Telegram com download de vídeos, extração de áudio e lembretes. O bot usa ferramentas gratuitas como `youtube-dl-exec` e `ffmpeg` para baixar e processar mídia.

---

## 📋 Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Comandos](#comandos)
- [Arquitetura](#arquitetura)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## ✨ Características

- **Download de vídeos** em TikTok, Instagram, YouTube e Twitter/X usando `youtube-dl-exec`
- **Extração de áudio** em MP3 com `ffmpeg`
- **Lembretes** agendados com persistência em JSON
- **Rate limiting** para evitar abuso
- **Boas práticas**: separação de responsabilidades e logs estruturados

---

## 📦 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- FFmpeg instalado no sistema
- Token do Telegram Bot

### Instalação de FFmpeg

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
- Instale via Chocolatey: `choco install ffmpeg`
- Ou baixe de https://ffmpeg.org/download.html

---

## 🚀 Instalação

```bash
git clone https://github.com/duzzx22/Puxa--videos-bot.git
cd Puxa--videos-bot
npm install
```

---

## ⚙️ Configuração

Este projeto permite uso de `.env` para desenvolvimento local. No arquivo `.env`, você precisa definir apenas o token do bot:

```env
BOT_TOKEN=seu_token_aqui
```

Outras configurações são opcionais e podem ser definidas diretamente como variáveis de ambiente no servidor de produção.

### Variáveis de ambiente principais

- `BOT_TOKEN` - token do bot Telegram (obrigatório)
- `WEBHOOK_URL` - URL de webhook (opcional)
- `WEBHOOK_PORT` - porta do webhook (padrão: 3000)
- `TIMEZONE` - timezone para exibição de datas
- `NODE_ENV` - `development` ou `production`
- `DEBUG` - `true` ou `false`

### Exemplo de configuração no Linux/macOS

```bash
export BOT_TOKEN="SEU_TOKEN_AQUI"
export WEBHOOK_PORT=3000
export ENABLE_TIKTOK=true
export ENABLE_INSTAGRAM=true
export ENABLE_YOUTUBE=true
export ENABLE_TWITTER=true
export TIMEZONE="America/Sao_Paulo"
```

#### Windows PowerShell
```powershell
$env:BOT_TOKEN = "SEU_TOKEN_AQUI"
```

---

## 📱 Uso

### Iniciar em modo de desenvolvimento (polling)

```bash
npm run dev
```

### Iniciar em produção (webhook)

```bash
npm start
```

---

## 🧩 Comandos

### 🎬 Mídia

- `/video <url>` — baixa o vídeo da URL
- `/audio <url>` — extrai o áudio do vídeo em MP3

### ⏰ Lembretes

- `/remind <tempo> <mensagem>` — cria um lembrete
- `/reminders` — lista lembretes do usuário
- `/cancel <id>` — cancela um lembrete

### 📅 Utilidades

- `/date` — mostra data e hora atual
- `/status` — mostra status do bot
- `/help` — exibe ajuda e lista de comandos
- `/start` — mensagem de boas-vindas

### 🔧 Exemplos

```text
/video https://www.tiktok.com/@usuario/video/1234567890
/audio https://www.youtube.com/watch?v=dQw4w9WgXcQ
/remind 10m Estudar matemática
```

---

## 🏗️ Arquitetura

O bot segue um padrão modular:

- `src/bot.js` — inicializa o bot e configura middleware
- `src/index.js` — ponto de entrada e modo webhook
- `src/controllers/` — tratamento dos comandos
- `src/services/` — lógica de download, áudio e lembretes
- `src/repositories/` — persistência de lembretes em JSON
- `src/middlewares/` — autenticação e rate limit
- `src/jobs/` — scheduler de lembretes
- `src/utils/` — helpers e logger
- `src/config.js` — configurações e defaults

---

## 🧪 Troubleshooting

- `BOT_TOKEN não configurado`: defina `BOT_TOKEN` no ambiente
- `FFmpeg não instalado`: instale `ffmpeg` no sistema
- `Arquivo muito grande`: o Telegram limita a 50MB no envio de mídia
- `Problema de webhook`: verifique `WEBHOOK_URL` e `WEBHOOK_PORT`

---

## 📜 Licença

MIT
