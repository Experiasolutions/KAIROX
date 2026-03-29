#!/bin/bash
# ================================================================
# START LOCAL BRIDGE
# Rode este script na sua MÁQUINA LOCAL para ativar o bridge
# Uso: bash scripts/start-local-bridge.sh
# ================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.bridge"
PORT="${BRIDGE_LOCAL_PORT:-8765}"

echo ""
echo "🌉 LOCAL BRIDGE — AIOS"
echo "========================"

# Verificar .env.bridge
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.bridge não encontrado em: $ENV_FILE"
  echo ""
  echo "Crie o arquivo com:"
  echo "  cp .env.bridge.example .env.bridge"
  echo "  # Edite com seu token"
  exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale em: https://nodejs.org"
  exit 1
fi

# Verificar dependência ws
cd "$PROJECT_DIR"
if [ ! -d "node_modules/ws" ]; then
  echo "📦 Instalando dependências..."
  npm install ws dotenv
fi

# Verificar ngrok
if ! command -v ngrok &> /dev/null; then
  echo "⚠️  ngrok não encontrado."
  echo "   Instale: npm install -g ngrok"
  echo "   Ou: https://ngrok.com/download"
  echo ""
  echo "▶ Iniciando bridge sem túnel (apenas localhost)..."
  echo "  Para acesso remoto do Codespaces, instale ngrok."
  echo ""
  node "$SCRIPT_DIR/local-bridge.js"
  exit 0
fi

# Iniciar bridge em background
echo "▶ Iniciando local-bridge.js na porta $PORT..."
node "$SCRIPT_DIR/local-bridge.js" &
BRIDGE_PID=$!
echo "  PID: $BRIDGE_PID"

# Aguardar bridge estar pronto
sleep 1

# Iniciar ngrok
echo ""
echo "▶ Iniciando ngrok..."
echo "  Copie a URL 'Forwarding wss://...' e cole em .env.bridge no Codespaces"
echo ""
ngrok http "$PORT"

# Cleanup ao encerrar (Ctrl+C)
trap "kill $BRIDGE_PID 2>/dev/null; echo 'Bridge encerrado.'" EXIT
