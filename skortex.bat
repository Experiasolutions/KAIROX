@echo off
title SKORTEX CLI (KAIROX God Pool)
setlocal
echo.
echo ===========================================================
echo    [ KAIROX SOVEREIGN ENGINE - SKORTEX CLI v3.1 ]
echo    [ God Pool: 7 Providers ^| 87+ API Keys       ]
echo ===========================================================
echo.

REM ── Mata proxy stale na porta 4000 (garante config atualizada) ──
echo [God Pool] Encerrando instancias anteriores...
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":4000 " ^| findstr "LISTENING"') do (
    echo [God Pool] Matando PID %%P...
    taskkill /PID %%P /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM ── Inicia proxy fresco com YAML atualizado ──
echo [God Pool] Iniciando proxy com configuracao atual...
if not exist "%~dp0logs" mkdir "%~dp0logs"
start /b node "%~dp0god-kairos\god-pool-proxy.js" >> "%~dp0logs\god-pool.log" 2>&1
timeout /t 4 /nobreak >nul

REM ── Verifica saude do proxy ──
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [God Pool] ONLINE em localhost:4000
    echo [God Pool] Verificando keys carregadas...
    curl -s http://localhost:4000/health
) else (
    echo [AVISO] Proxy nao respondeu - verifique logs\god-pool.log
)
echo.

REM ── Configura variaveis para o OpenClaude ──
set ANTHROPIC_BASE_URL=http://localhost:4000
set ANTHROPIC_API_KEY=skortex-god-pool
set CLAUDE_BASE_URL=http://localhost:4000
set NODE_NO_WARNINGS=1

echo [Base] ANTHROPIC_BASE_URL=http://localhost:4000
echo [Info] Ctrl+C para encerrar o OpenClaude (proxy continua em background)
echo.

REM ── Chama o executavel global do OpenClaude ──
call openclaude %*
