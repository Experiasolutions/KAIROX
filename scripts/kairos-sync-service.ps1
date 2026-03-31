<#
.SYNOPSIS
Registra e inicia o KAIROS Cloud Sync (KCS) no PM2 para rodar em background no PC.

.DESCRIPTION
Esse script garante que o daemon de sincronização do Obsidian fique sempre rodando 
invisivelmente no Windows usando o PM2.

.EXAMPLE
.\kairos-sync-service.ps1
#>

# Certifica-se de que o PM2 está instalado globalmente
$pm2Exists = Get-Command "pm2" -ErrorAction SilentlyContinue
if (-not $pm2Exists) {
    Write-Host "Instalando PM2 (Gerenciador de Processos Node.js)..." -ForegroundColor Yellow
    npm install -g pm2
}

# Caminho do Script
$ScriptPath = Join-Path $PSScriptRoot "kairos-cloud-sync.js"
$ProcessName = "kairos-cloud-sync"

# Apaga instâncias velhas do PM2 (se o PC tiver reiniciado errado)
pm2 delete $ProcessName 2>$null

# Inicia o Daemon de Sincronia
Write-Host "Iniciando $ProcessName em background..." -ForegroundColor Green
pm2 start $ScriptPath --name $ProcessName --exp-backoff-restart-delay=100

# Salva a lista de processos do PM2 para reiniciar com a máquina (PM2 Save)
pm2 save

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "KAIROS CLOUD SYNC Ativado em background via PM2." -ForegroundColor Cyan
Write-Host "Para checar logs futuramente, use o comando: pm2 logs $ProcessName" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
