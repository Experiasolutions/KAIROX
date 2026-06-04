#!/bin/bash
# Lista variáveis de ambiente de um serviço Railway
# Uso: ./railway_env.sh <service-name>
# Requer: railway CLI autenticado

SERVICE=${1:-"kairos"}
echo "Variáveis de ambiente de $SERVICE:"
railway variables --service "$SERVICE"
