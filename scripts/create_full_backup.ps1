# AIOS Full Portable Backup Script (With History)
$sourceProject = "C:\Users\Gabriel\Documents\aios-core-main\aios-core\meu-projeto-ai"
$sourceSkills = "C:\Users\Gabriel\.openclaw"
$sourceMemory = "C:\Users\Gabriel\.gemini"
$destDir = "$HOME\Documents\AIOS_FULL_BACKUP"
$zipPath = "$HOME\Documents\AIOS_FULL_BACKUP.zip"

Write-Host "Iniciando backup COMPLETO (com histórico)..."

# 1. Limpar e criar diretório
if (Test-Path $destDir) { Remove-Item -Path $destDir -Recurse -Force }
New-Item -ItemType Directory -Path $destDir | Out-Null
New-Item -ItemType Directory -Path "$destDir\project" | Out-Null
New-Item -ItemType Directory -Path "$destDir\user_data" | Out-Null

# 2. Copiar Projeto (Excluindo node_modules)
Write-Host "Copiando projeto..."
robocopy $sourceProject "$destDir\project" /E /XD node_modules .git .vscode coverage dist /XF *.log *.lock
# Robocopy: exit code < 8 is success

# 3. Copiar Skills (.openclaw)
Write-Host "Copiando skills..."
Copy-Item -Path $sourceSkills -Destination "$destDir\user_data\.openclaw" -Recurse -Force

# 4. Copiar Memória/Histórico (.gemini)
# ATENCAO: Isso é o que permite ver a conversa antiga
Write-Host "Copiando histórico (.gemini)..."
Copy-Item -Path $sourceMemory -Destination "$destDir\user_data\.gemini" -Recurse -Force

# 5. Criar Script de Restauração Automática (restore.ps1)
$restoreScript = @"
Write-Host "Iniciando restauração do ambiente AIOS..."

# 1. Restaurar Skills e Memória para a pasta do Usuário atual
\$userHome = [System.Environment]::GetFolderPath('UserProfile')
\$scriptPath = \$PSScriptRoot

Write-Host "Restaurando dados para \$userHome ..."

if (Test-Path "\$scriptPath\user_data\.openclaw") {
    Copy-Item -Path "\$scriptPath\user_data\.openclaw" -Destination "\$userHome\.openclaw" -Recurse -Force
    Write-Host "  [OK] Skills (.openclaw) restauradas."
}

if (Test-Path "\$scriptPath\user_data\.gemini") {
    Copy-Item -Path "\$scriptPath\user_data\.gemini" -Destination "\$userHome\.gemini" -Recurse -Force
    Write-Host "  [OK] Memória e Histórico (.gemini) restaurados."
}

# 2. Instalar dependências do projeto
if (Test-Path "\$scriptPath\project\package.json") {
    Write-Host "Instalando dependências do Node.js..."
    Set-Location "\$scriptPath\project"
    npm install
    Write-Host "  [OK] Dependências instaladas."
}

Write-Host "---------------------------------------------------"
Write-Host "SETUP CONCLUÍDO!"
Write-Host "Para iniciar, abra a pasta 'project' no Antigravity e rode:"
Write-Host "node scripts/dashboard.js"
Write-Host "---------------------------------------------------"
"@
Set-Content -Path "$destDir\restore.ps1" -Value $restoreScript

# 6. Criar Prompt de Instrução
$promptText = @"
# INSTRUÇÃO PARA O ANTIGRAVITY (NO NOVO PC):

1. Abra esta pasta ($destDir) no Antigravity.
2. Copie e cole o seguinte comando no chat:

"Por favor, execute o script 'restore.ps1' localizado na raiz deste diretório para configurar meu ambiente automaticamente, restaurando meu histórico e instalando as dependências."

"@
Set-Content -Path "$destDir\PROMPT_PARA_CONFIGURAR.txt" -Value $promptText

# 7. Compactar
Write-Host "Compactando tudo para $zipPath ..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$destDir\*" -DestinationPath $zipPath

Write-Host "BACKUP COMPLETO CRIADO COM SUCESSO!"
Write-Host "Arquivo: $zipPath"
