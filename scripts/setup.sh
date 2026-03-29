
echo ""
echo "[BRIDGE] Local Bridge (opcional)"
if [ ! -f ".env.bridge" ]; then
  cp .env.bridge.example .env.bridge
  echo "  ✅ .env.bridge.example copiado para .env.bridge"
  echo "  ⚠️  Configure BRIDGE_TOKEN e BRIDGE_WS_URL para ativar"
  echo "  📖 Ver: docs/LOCAL-BRIDGE-SETUP.md"
else
  echo "  ✅ .env.bridge já existe"
fi
