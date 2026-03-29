$sourceDir = "C:\Users\Gabriel\.gemini\antigravity"
$destinationFile = "C:\Users\Gabriel\Documents\Antigravity_Backup_20260223.zip"

if (Test-Path $destinationFile) {
    Remove-Item $destinationFile
}

Write-Host "Backing up $sourceDir to $destinationFile..."
Compress-Archive -Path $sourceDir -DestinationPath $destinationFile -Force
Write-Host "Backup completed successfully."
