# 🤖 Puxa Vídeos Bot

Bot para Telegram que baixa vídeos e extrai áudio de TikTok, Instagram, YouTube e Twitter/X usando ferramentas gratuitas.

## 📦 Requisitos

- Node.js >= 18.0.0
- FFmpeg instalado no sistema
- Token do bot Telegram

### Instalar FFmpeg

#### Ubuntu/Debian
```bash
sudo apt-get update && sudo apt-get install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

## 🚀 Instalação

```bash
git clone https://github.com/duzzx22/Puxa--videos-bot.git
cd Puxa--videos-bot
npm install
```

## ⚙️ Configuração

1. Crie arquivo `.env`:
```env
BOT_TOKEN=seu_token_aqui
```

2. Obtenha o token do bot no [@BotFather](https://t.me/botfather)

## 📱 Uso

```bash
npm run dev  # desenvolvimento
npm start    # produção
```

## 🧩 Comandos

- `/video <url>` — baixa vídeo
- `/audio <url>` — extrai áudio em MP3
- `/remind <tempo> <msg>` — cria lembrete
- `/reminders` — lista lembretes
- `/cancel <id>` — cancela lembrete
- `/date` — mostra data/hora
- `/status` — status do bot
- `/help` — ajuda
- `/start` — boas-vindas

### Exemplos

```
/video https://tiktok.com/@user/video/123
/audio https://youtube.com/watch?v=abc
/remind 10m Estudar
```

## 📜 Licença

MIT
