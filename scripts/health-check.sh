
# Bridge
echo "[5/5] Local Bridge..."
if [ -n "$BRIDGE_WS_URL" ]; then
    echo "  ✅ BRIDGE_WS_URL configurada"
    if node -e "
      require('dotenv').config({ path: '.env.bridge' });
      const { executeLocalCommand } = require('./scripts/codespaces-tunnel');
      executeLocalCommand('echo bridge-ok')
        .then(r => { process.stdout.write(r.stdout); process.exit(0); })
        .catch(() => process.exit(1));
    " 2>/dev/null | grep -q 'bridge-ok'; then
        echo "  ✅ Conexão com terminal local: OK"
    else
        echo "  ⚠️  Bridge configurado mas sem resposta do local"
        echo "     Rode na máquina local: bash scripts/start-local-bridge.sh"
    fi
else
    echo "  ⚪ Bridge não configurado (opcional)"
    echo "     Para ativar: ver docs/LOCAL-BRIDGE-SETUP.md"
fi

echo "Health check completo!"
