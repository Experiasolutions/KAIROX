# AIOS Portable Backup Script
$sourceProject = "C:\Users\Gabriel\Documents\aios-core-main\aios-core\meu-projeto-ai"
$sourceSkills = "C:\Users\Gabriel\.openclaw"
$destDir = "$HOME\Documents\AIOS_EXPORT"
$zipPath = "$HOME\Documents\AIOS_PORTABLE.zip"

Write-Host "Iniciando backup..."

# 1. Limpar e criar diretório temporário
if (Test-Path $destDir) { Remove-Item -Path $destDir -Recurse -Force }
New-Item -ItemType Directory -Path $destDir | Out-Null
New-Item -ItemType Directory -Path "$destDir\meu-projeto-ai" | Out-Null

# 2. Copiar Projeto (Excluindo node_modules e arquivos pesados/desnecessários)
Write-Host "Copiando projeto..."
robocopy $sourceProject "$destDir\meu-projeto-ai" /E /XD node_modules .git .gemini .vscode coverage dist /XF *.log *.lock
# Robocopy retorna códigos de saída diferentes de 0 mesmo em sucesso (1 = sucesso copiar). Ignorar erro se < 8.

# 3. Copiar Skills (.openclaw)
Write-Host "Copiando skills..."
Copy-Item -Path $sourceSkills -Destination "$destDir\.openclaw" -Recurse -Force

# 4. Criar Instruções
$instructions = @"
# COMO INSTALAR O AIOS NO NOVO COMPUTADOR

1. **Preparação no Notebook Novo:**
   - Instale o **Node.js** (versão LTS recomendada: https://nodejs.org/).
   - Instale o **VS Code** e o **Antigravity** (se for usar).

2. **Copiando os Arquivos:**
   - Copie a pasta '.openclaw' deste backup para a pasta do usuário do novo computador.
     - Caminho final deve ser: C:\Users\SEU_USUARIO\.openclaw
   - Copie a pasta 'meu-projeto-ai' para onde preferir (ex: Meus Documentos).

3. **Instalando Dependências:**
   - Abra a pasta 'meu-projeto-ai' no VS Code ou Terminal.
   - Execute o comando:
     npm install
   - Isso vai baixar todas as bibliotecas necessárias (node_modules).

4. **Configuração:**
   - Verifique se o arquivo '.env' está presente na raiz da pasta 'meu-projeto-ai'.
   - Ele contém suas chaves de API. Se não estiver, crie um novo com suas chaves.

5. **Rodando:**
   - Tudo pronto! Pode rodar seus agentes ou o dashboard:
     node scripts/dashboard.js

Boa sorte com a instalação!
"@
Set-Content -Path "$destDir\LEIA_ME_INSTALACAO.md" -Value $instructions

# 5. Compactar
Write-Host "Compactando para $zipPath ..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$destDir\*" -DestinationPath $zipPath

Write-Host "Backup concluído com sucesso!"
Write-Host "Arquivo criado em: $zipPath"
