#!/bin/bash

# 🚀 PUXA VÍDEOS BOT - SETUP SCRIPT
# Quick setup para começar em 2 minutos

set -e  # Exit on error

echo "════════════════════════════════════════════════════════"
echo "🤖 Puxa Vídeos Bot - Instalação Rápida"
echo "════════════════════════════════════════════════════════"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale versão 18+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION encontrado"

# Verifica npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"
echo ""

# Instala dependências
echo "📦 Instalando dependências..."
npm install

# Cria arquivo .env
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Configure o arquivo .env com:"
    echo "   1. Abra: .env"
    echo "   2. Configure BOT_TOKEN (obtenha em @BotFather)"
    echo "   3. Configure ADMIN_IDS com seu user ID"
    echo ""
    echo "📖 Para obter seu User ID, envie /start em:"
    echo "   👉 https://t.me/userinfobot"
else
    echo "✅ Arquivo .env já existe"
fi

# Cria diretórios
echo "📁 Criando diretórios..."
mkdir -p logs data temp

# Verifica FFmpeg
echo ""
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg não encontrado"
    echo "   Para extração de áudio, instale FFmpeg:"
    echo "   Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Windows: choco install ffmpeg"
else
    echo "✅ FFmpeg $(ffmpeg -version | head -n 1 | cut -d' ' -f3) encontrado"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ INSTALAÇÃO COMPLETA!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📝 Próximos Passos:"
echo "   1. Edite o arquivo .env com seus valores"
echo "   2. Execute: npm run dev"
echo "   3. Teste os comandos no Telegram"
echo ""
echo "📚 Documentação:"
echo "   • README.md - Guia Completo"
echo "   • QUICK_REFERENCE.md - Referência Rápida"
echo "   • DEVELOPMENT.md - Para Desenvolvedores"
echo ""
echo "🎯 Comandos Rápidos:"
echo "   npm run dev      - Desenvolvimento (com auto-reload)"
echo "   npm start        - Produção"
echo "   npm run lint     - Verificar código"
echo ""
echo "🚀 Bom desenvolvimento!"
echo ""
