@echo off
title OpenClaude (KAIROX God Pool)
echo.
echo ===========================================================
echo    [ KAIROX SOVEREIGN ENGINE - EXECUTOR TERMINAL ]
echo    [ God Pool: Gemini + Groq + GitHub Models             ]
echo ===========================================================
echo.

REM Cria pasta de logs se nao existir
if not exist "%~dp0logs" mkdir "%~dp0logs"

REM Verifica se o proxy ja esta rodando na porta 4000
netstat -ano 2>nul | findstr ":4000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo [God Pool] Proxy ja ativo em localhost:4000
) else (
    echo [God Pool] Iniciando proxy em background...
    start /b node "%~dp0god-kairos\god-pool-proxy.js" >> "%~dp0logs\god-pool.log" 2>&1
    REM Aguarda proxy subir (max 3s)
    timeout /t 3 /nobreak >nul
    echo [God Pool] Proxy ativo em localhost:4000
)

echo.
echo [Router] haiku -> Groq Fast  ^| default -> Gemini  ^| opus -> Groq Heavy
echo [Keys]   Gemini: 6  ^| Groq: 3  ^| GitHub: 1
echo.

REM Aponta o Claude Code para o God Pool via ANTHROPIC_BASE_URL
set ANTHROPIC_BASE_URL=http://localhost:4000
set ANTHROPIC_API_KEY=god-pool-bypass

REM Inicia Claude no workspace KAIROS
claude %*
