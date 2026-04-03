# ============================================================
# KAIROS Quick Handoff Script
# Executa commit + push de TUDO em ambos os repos
# Uso: .\scripts\quick-handoff.ps1
# ============================================================

param(
    [string]$Message = "chore(handoff): session save $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KAIROS QUICK HANDOFF" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkCyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Detectar paths ---
$KairosPath = Split-Path -Parent $PSScriptRoot
$ApexPaths = @(
    "C:\Users\maymo\OneDrive\Documentos\apex-conductor",
    "C:\Users\GABS\Documents\apex-conductor",
    "$env:USERPROFILE\OneDrive\Documentos\apex-conductor",
    "$env:USERPROFILE\Documents\apex-conductor"
)

$ApexPath = $null
foreach ($p in $ApexPaths) {
    if (Test-Path "$p\.git") {
        $ApexPath = $p
        break
    }
}

# --- Funcao de commit+push ---
function Push-Repo {
    param(
        [string]$Path,
        [string]$Name,
        [string]$CommitMsg
    )

    if (-not (Test-Path "$Path\.git")) {
        Write-Host "  [SKIP] $Name - nao e um repo git" -ForegroundColor Yellow
        return
    }

    Push-Location $Path
    Write-Host "--- $Name ---" -ForegroundColor Green
    Write-Host "  Path: $Path" -ForegroundColor DarkGray

    # Status
    $status = git status --porcelain 2>&1
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "  [OK] Nada para commitar" -ForegroundColor DarkGreen
        Pop-Location
        return
    }

    $fileCount = ($status -split "`n").Count
    Write-Host "  Arquivos modificados: $fileCount" -ForegroundColor Yellow

    # Stage + Commit + Push
    git add -A 2>&1 | Out-Null
    $commitResult = git commit --no-verify -m $CommitMsg 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Commit realizado" -ForegroundColor Green
        
        $pushResult = git push origin main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Push realizado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "  [ERRO] Push falhou: $pushResult" -ForegroundColor Red
        }
    } else {
        Write-Host "  [WARN] Commit: $commitResult" -ForegroundColor Yellow
    }

    # Mostrar ultimo commit
    $lastCommit = git log --oneline -1 2>&1
    Write-Host "  Ultimo commit: $lastCommit" -ForegroundColor DarkGray

    Pop-Location
    Write-Host ""
}

# --- Executar ---
Write-Host "REPO 1: KAIROX" -ForegroundColor Magenta
Push-Repo -Path $KairosPath -Name "KAIROX" -CommitMsg $Message

if ($ApexPath) {
    Write-Host "REPO 2: Apex Conductor" -ForegroundColor Magenta
    Push-Repo -Path $ApexPath -Name "apex-conductor" -CommitMsg $Message
} else {
    Write-Host "REPO 2: Apex Conductor - NAO ENCONTRADO" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HANDOFF COMPLETO!" -ForegroundColor Green
Write-Host "  No PC principal, execute:" -ForegroundColor DarkCyan
Write-Host "    git pull origin main" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
