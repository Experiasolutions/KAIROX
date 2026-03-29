# AIOS Bridge — PowerShell Wrapper para UiPath
# Uso: .\run-bridge.ps1 -Context "caminho\para\context.json" [-Project "whatsapp-autoreply"]
#
# O UiPath chama este script, que executa o bridge Node.js.

param(
    [Parameter(Mandatory=$true)]
    [string]$Context,
    
    [Parameter(Mandatory=$false)]
    [string]$Project = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Verificar Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar se dotenv está instalado
$nodeModules = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    npm install --production 2>&1 | Out-Null
    Pop-Location
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
}

# Resolver caminho do contexto
$ContextPath = Resolve-Path $Context -ErrorAction Stop

# Executar bridge
$bridgeScript = Join-Path $ScriptDir "experia_bridge.js"
$args_list = @($bridgeScript, $ContextPath)
if ($Project -ne "") {
    $args_list += $Project
}

Write-Host "🔌 AIOS Bridge executando..." -ForegroundColor Cyan
Write-Host "   Context: $ContextPath" -ForegroundColor Gray
if ($Project -ne "") {
    Write-Host "   Project: $Project" -ForegroundColor Gray
}

node @args_list

# Verificar resultado
$actionPath = Join-Path $ProjectRoot "action.json"
if (Test-Path $actionPath) {
    $action = Get-Content $actionPath | ConvertFrom-Json
    if ($action.status -eq "success") {
        Write-Host "✅ Ação gerada: $($action.action.type)" -ForegroundColor Green
    } elseif ($action.status -eq "blocked") {
        Write-Host "🛡️ Bloqueado: $($action.reason)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro: $($action.error)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ action.json não foi gerado" -ForegroundColor Red
    exit 1
}
