# =============================================================
# OPL Split Fix v3 - God of War 2
# =============================================================

$ErrorActionPreference = "Continue"
$TargetDrive = "G:\"
$UlCfg = Join-Path $TargetDrive "ul.cfg"
[long]$ChunkSize = 1073741824  # 1GB per chunk

# Clean up ALL ul.* files from previous runs
Write-Host "Cleaning up previous ul.* files (if any)..." -ForegroundColor Yellow
Get-ChildItem $TargetDrive -Filter "ul.*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# Games to split
$games = @(
    @{ Path = "E:\GOD OF WAR 2 PTBR V4.3.iso"; Name = "God of War 2 (PT-BR)"; ID = "SCUS_974.81" }
)

Write-Host "`n=== OPL Split Fix v3 (God of War 2) ===" -ForegroundColor Cyan

foreach ($game in $games) {
    $isoPath = $game.Path
    $gameName = $game.Name
    $gameID = $game.ID

    if (-not (Test-Path $isoPath)) {
        Write-Host "NOT FOUND: $isoPath" -ForegroundColor Red
        continue
    }

    $fileInfo = Get-Item $isoPath
    [long]$totalSize = $fileInfo.Length
    $totalParts = [int][math]::Ceiling([double]$totalSize / [double]$ChunkSize)

    Write-Host "`nSplitting: $gameName ($([math]::Round($totalSize / 1GB, 2)) GB -> $totalParts parts)" -ForegroundColor Yellow

    # Generate CRC for ul filename using MD5 of game name
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $hash = $md5.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($gameName))
    $crc = ($hash[0..3] | ForEach-Object { $_.ToString("X2") }) -join ""

    Write-Host "  CRC: $crc | ID: $gameID"

    $stream = [System.IO.File]::OpenRead($isoPath)
    [byte[]]$buf = New-Object byte[] 65536  # 64KB buffer

    for ($p = 0; $p -lt $totalParts; $p++) {
        $partHex = $p.ToString("X2")
        $chunkFile = "ul.$crc.$gameID.$partHex"
        $chunkPath = Join-Path $TargetDrive $chunkFile

        Write-Host "  [$($p+1)/$totalParts] $chunkFile ..." -NoNewline

        $out = [System.IO.File]::Create($chunkPath)
        [long]$written = 0

        while ($written -lt $ChunkSize) {
            [long]$remainChunk = $ChunkSize - $written
            [long]$remainFile = $totalSize - $stream.Position
            [long]$canRead = if ($remainChunk -lt $remainFile) { $remainChunk } else { $remainFile }
            [int]$toRead = if ($canRead -lt $buf.Length) { [int]$canRead } else { $buf.Length }

            if ($toRead -le 0) { break }

            $r = $stream.Read($buf, 0, $toRead)
            if ($r -eq 0) { break }
            $out.Write($buf, 0, $r)
            $written += $r
        }

        $out.Flush()
        $out.Close()
        Write-Host " $([math]::Round($written / 1MB, 0)) MB" -ForegroundColor Green
    }

    $stream.Close()

    # Write ul.cfg entry (64 bytes)
    $entry = New-Object byte[] 64
    $nb = [System.Text.Encoding]::ASCII.GetBytes($gameName)
    [Array]::Copy($nb, 0, $entry, 0, [math]::Min($nb.Length, 32))
    $ib = [System.Text.Encoding]::ASCII.GetBytes($gameID)
    [Array]::Copy($ib, 0, $entry, 32, [math]::Min($ib.Length, 15))
    $entry[47] = [byte]$totalParts
    $entry[48] = [byte]0x14  # DVD media type

    $fs = [System.IO.File]::Open($UlCfg, [System.IO.FileMode]::Append, [System.IO.FileAccess]::Write)
    $fs.Write($entry, 0, 64)
    $fs.Close()

    Write-Host "  ul.cfg updated: $gameName ($totalParts parts)" -ForegroundColor Green
}

Write-Host "`n=== Split Complete ===" -ForegroundColor Cyan

# Show all ul files
Write-Host "`n--- Files on G:\ root ---"
Get-ChildItem $TargetDrive -Filter "ul.*" | ForEach-Object {
    Write-Host "  $($_.Name) ($([math]::Round($_.Length / 1MB, 0)) MB)"
}

$vol = Get-Volume -DriveLetter G
Write-Host "`nFree space: $([math]::Round($vol.SizeRemaining / 1GB, 2)) GB" -ForegroundColor Cyan
Write-Host "Next step: defrag G: /O" -ForegroundColor Yellow
