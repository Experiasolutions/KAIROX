#!/bin/bash
# Deploy de um serviço específico no Railway
# Uso: ./railway_deploy.sh <service-name>
# Requer: railway CLI autenticado (railway login)

SERVICE=${1:-"kairos"}
echo "Iniciando deploy de $SERVICE no Railway..."
railway up --service "$SERVICE"
echo "Deploy concluído: $SERVICE"
