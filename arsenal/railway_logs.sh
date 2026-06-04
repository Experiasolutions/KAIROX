#!/bin/bash
# Leitura de logs de um serviço Railway
# Uso: ./railway_logs.sh <service-name> [tail-lines]
# Requer: railway CLI autenticado

SERVICE=${1:-"kairos"}
TAIL=${2:-100}
echo "Logs de $SERVICE (últimas $TAIL linhas):"
railway logs --service "$SERVICE" --tail "$TAIL"
