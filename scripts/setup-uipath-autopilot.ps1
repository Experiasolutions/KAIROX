<#
.SYNOPSIS
  AIOS — Abre UiPath Studio, copia o prompt do Autopilot para o clipboard.
.NOTES
  Chamado por: OpenClaw aios-uipath skill
#>

param(
    [switch]$DryRun
)

$UiPathExe = "C:\Program Files\UiPathPlatform\Studio\26.0.186-cloud.22084\UiPath.Studio.exe"
$ProjectRoot = "C:\Users\Gabriel\Downloads\aios-core-main\aios-core\meu-projeto-ai"

$AutopilotPrompt = 'Crie um workflow chamado "AIOS WhatsApp AutoReply" que faz o seguinte:

1. MONITORAMENTO:
   - Abra o Google Chrome no site "web.whatsapp.com"
   - Use "Monitor Events" ou "Element Exists" para detectar quando uma nova mensagem nao lida aparece (icone de badge verde no chat)
   - Quando detectar mensagem nao lida, clique no chat para abrir

2. EXTRACAO:
   - Use "Get Text" para extrair o nome do remetente (elemento do topo do chat aberto)
   - Use "Get Text" para extrair a ultima mensagem recebida (ultimo balao de mensagem do lado esquerdo)

3. CRIAR context.json:
   - Monte um objeto JSON com esta estrutura:
     {
       "source": "whatsapp_web",
       "trigger": "new_message",
       "project": "whatsapp-autoreply",
       "timestamp": "<timestamp atual>",
       "data": {
         "sender_name": "<nome extraido>",
         "sender_phone": "",
         "message_text": "<mensagem extraida>",
         "chat_history": []
       }
     }
   - Salve esse JSON no arquivo: ' + $ProjectRoot + '\context.json

4. CHAMAR O AIOS:
   - Use "Start Process":
     FileName: "node"
     Arguments: "' + $ProjectRoot + '\scripts\experia_bridge.js ' + $ProjectRoot + '\context.json whatsapp-autoreply"
     WorkingDirectory: "' + $ProjectRoot + '"
   - Aguarde o processo finalizar (maximo 15 segundos)

5. LER A RESPOSTA:
   - Leia o arquivo: ' + $ProjectRoot + '\action.json
   - Parse o JSON e extraia o campo "action.type" e "action.payload.text"

6. EXECUTAR A ACAO:
   - Se action.type = "reply_message":
     a. Clique no campo de texto do WhatsApp Web (caixa de digitacao na parte inferior)
     b. Use "Type Into" para digitar o texto de action.payload.text
     c. Pressione Enter para enviar
   - Se action.type = "mark_as_unread":
     a. NAO responda (handoff humano)
   - Se action.type = "schedule_appointment":
     a. NAO responda automaticamente
     b. Crie uma notificacao/log para o humano agendar

7. LOOP:
   - Volte ao passo 1 e continue monitorando
   - Adicione um delay de 5 segundos entre cada verificacao

CONFIGURACOES:
- O workflow deve rodar em foreground (precisa do browser visivel)
- Use Chrome como browser padrao
- Adicione tratamento de erro: se qualquer passo falhar, logue o erro e volte ao monitoramento
- Timeout de 15 segundos para a chamada ao AIOS'

Add-Type -AssemblyName System.Windows.Forms

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  AIOS - UiPath Autopilot Configurator" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] Prompt copiado para o clipboard!" -ForegroundColor Green
    [System.Windows.Forms.Clipboard]::SetText($AutopilotPrompt)
    Write-Host "[DRY RUN] Linhas no prompt: $(($AutopilotPrompt -split "`n").Count)" -ForegroundColor Cyan
    return
}

# 1. Verificar UiPath
$uiProc = Get-Process -Name "UiPath.Studio" -ErrorAction SilentlyContinue

if (-not $uiProc) {
    Write-Host "[1/4] Abrindo UiPath Studio..." -ForegroundColor Yellow
    if (Test-Path $UiPathExe) {
        Start-Process $UiPathExe
        Write-Host "       Aguardando carregar (30s)..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
        $uiProc = Get-Process -Name "UiPath.Studio" -ErrorAction SilentlyContinue
        if (-not $uiProc) {
            Write-Host "[ERRO] UiPath nao abriu. Abra manualmente." -ForegroundColor Red
            return
        }
    } else {
        Write-Host "[ERRO] UiPath nao encontrado em: $UiPathExe" -ForegroundColor Red
        return
    }
} else {
    Write-Host "[1/4] UiPath Studio ja esta aberto" -ForegroundColor Green
}

# 2. Trazer para frente
Write-Host "[2/4] Trazendo UiPath para frente..." -ForegroundColor Yellow

$winApiCode = 'using System; using System.Runtime.InteropServices; public class WinAPI { [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd); [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow); }'

try { Add-Type -TypeDefinition $winApiCode -ErrorAction SilentlyContinue } catch {}

$hwnd = $uiProc.MainWindowHandle
[WinAPI]::ShowWindow($hwnd, 9) | Out-Null
Start-Sleep -Milliseconds 500
[WinAPI]::SetForegroundWindow($hwnd) | Out-Null
Start-Sleep -Seconds 1
Write-Host "       UiPath em foco." -ForegroundColor Green

# 3. Copiar prompt
Write-Host "[3/4] Copiando prompt para clipboard..." -ForegroundColor Yellow
[System.Windows.Forms.Clipboard]::SetText($AutopilotPrompt)
Write-Host "       Prompt copiado!" -ForegroundColor Green

# 4. Instrucoes
Write-Host "[4/4] Instrucoes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  No UiPath Studio:" -ForegroundColor White
Write-Host "    1. Clique no icone do Autopilot (barra superior)" -ForegroundColor White
Write-Host "    2. No campo de texto, pressione Ctrl+V" -ForegroundColor White
Write-Host "    3. Clique em Generate" -ForegroundColor White
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Orion - Primeira acao autonoma concluida!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
