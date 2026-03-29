# =============================================================
# OPL Split & Transfer Script
# Purpose: Transfer PS2 ISOs from E:\ to G:\ (OPL USB drive)
#   - ISOs < 4GB → copy directly to G:\DVD
#   - ISOs >= 4GB → split into ul.XXXX chunks + update ul.cfg
# =============================================================

$ErrorActionPreference = "Stop"
$SourceDrive = "E:\"
$TargetDrive = "G:\"
$TargetDVD = "G:\DVD"
$UlCfg = Join-Path $TargetDrive "ul.cfg"
$ChunkSize = 1073741824  # 1GB chunks (OPL standard ul format)
$Threshold = 4294967296  # 4GB FAT32 limit

# Ensure target DVD folder exists
if (-not (Test-Path $TargetDVD)) {
    New-Item -ItemType Directory -Path $TargetDVD -Force | Out-Null
}

# Get all ISOs from source
$isos = Get-ChildItem -Path $SourceDrive -Filter *.iso -ErrorAction SilentlyContinue

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OPL Split & Transfer Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Source: $SourceDrive"
Write-Host "Target: $TargetDrive"
Write-Host "Games found: $($isos.Count)"
Write-Host "========================================`n"

$directCopy = @()
$needsSplit = @()

foreach ($iso in $isos) {
    if ($iso.Length -ge $Threshold) {
        $needsSplit += $iso
        Write-Host "[SPLIT] $($iso.Name) ($([math]::Round($iso.Length / 1GB, 2)) GB)" -ForegroundColor Yellow
    } else {
        $directCopy += $iso
        Write-Host "[COPY]  $($iso.Name) ($([math]::Round($iso.Length / 1GB, 2)) GB)" -ForegroundColor Green
    }
}

Write-Host "`n--- Phase 1: Direct Copy ($($directCopy.Count) games) ---" -ForegroundColor Cyan

foreach ($iso in $directCopy) {
    $dest = Join-Path $TargetDVD $iso.Name
    if (Test-Path $dest) {
        Write-Host "  SKIP (exists): $($iso.Name)" -ForegroundColor DarkGray
    } else {
        Write-Host "  Copying: $($iso.Name) ..." -NoNewline
        Copy-Item -Path $iso.FullName -Destination $dest
        Write-Host " OK" -ForegroundColor Green
    }
}

Write-Host "`n--- Phase 2: Split & Transfer ($($needsSplit.Count) games) ---" -ForegroundColor Cyan

# Function to generate OPL ul-format game ID from ISO
function Get-OPLGameID {
    param([string]$IsoPath)
    
    # Read the first 16 bytes at offset 0x8373 of the ISO to find the game serial
    # OPL uses the SYSTEM.CNF from the ISO to get the game ID
    # For simplicity, we'll extract it from the ISO header
    try {
        $stream = [System.IO.File]::OpenRead($IsoPath)
        # PS2 ISO primary volume descriptor is at sector 16 (0x8000)
        # System Identifier / Volume Identifier
        $buffer = New-Object byte[] 2048
        $stream.Seek(0x8000, [System.IO.SeekOrigin]::Begin) | Out-Null
        $stream.Read($buffer, 0, 2048) | Out-Null
        
        # Volume ID is at offset 40 (0x28) in PVD, 32 bytes
        $volumeId = [System.Text.Encoding]::ASCII.GetString($buffer, 40, 32).Trim()
        $stream.Close()
        
        if ($volumeId -and $volumeId.Length -gt 0) {
            return $volumeId
        }
    } catch {
        Write-Host "  Warning: Could not read ISO header, using filename" -ForegroundColor Yellow
    }
    
    # Fallback: use filename
    return [System.IO.Path]::GetFileNameWithoutExtension($IsoPath)
}

# Function to create ul.cfg entry (fixed 64-byte record)
function Add-UlCfgEntry {
    param(
        [string]$UlCfgPath,
        [string]$GameName,
        [string]$GameID,
        [int]$Parts,
        [byte]$MediaType  # 0x12 = CD, 0x14 = DVD
    )
    
    # ul.cfg format: 64 bytes per entry
    # Bytes 0-31:  Game name (padded with 0x00)
    # Bytes 32-46: Game ID (e.g., "ul.SLUS_123.45") padded
    # Byte 47:     Number of parts
    # Bytes 48-63: Media type + padding
    
    $entry = New-Object byte[] 64
    
    # Game name (first 32 bytes)
    $nameBytes = [System.Text.Encoding]::ASCII.GetBytes($GameName)
    $nameLen = [math]::Min($nameBytes.Length, 32)
    [Array]::Copy($nameBytes, 0, $entry, 0, $nameLen)
    
    # Game ID (next 15 bytes)
    $idBytes = [System.Text.Encoding]::ASCII.GetBytes($GameID)
    $idLen = [math]::Min($idBytes.Length, 15)
    [Array]::Copy($idBytes, 0, $entry, 32, $idLen)
    
    # Number of parts
    $entry[47] = [byte]$Parts
    
    # Media type
    $entry[48] = $MediaType
    
    # Append to ul.cfg
    $fs = [System.IO.File]::Open($UlCfgPath, [System.IO.FileMode]::Append, [System.IO.FileAccess]::Write)
    $fs.Write($entry, 0, 64)
    $fs.Close()
    
    Write-Host "  ul.cfg entry added: $GameName ($GameID, $Parts parts)" -ForegroundColor Green
}

foreach ($iso in $needsSplit) {
    Write-Host "`n  Processing: $($iso.Name)" -ForegroundColor Yellow
    
    $gameId = Get-OPLGameID -IsoPath $iso.FullName
    Write-Host "  Game ID: $gameId"
    
    # Calculate CRC32 of the game name for ul chunk filenames
    $gameName = [System.IO.Path]::GetFileNameWithoutExtension($iso.Name)
    
    # OPL uses MD5-based naming for ul files
    # Format: ul.{CRC32_HEX}.{GAME_ID}.{PART_NUMBER_HEX}
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $nameHash = $md5.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($gameName))
    $hashHex = ($nameHash | ForEach-Object { $_.ToString("X2") }) -join ""
    $crc = $hashHex.Substring(0, 8)
    
    # Split file
    $stream = [System.IO.File]::OpenRead($iso.FullName)
    $totalSize = $stream.Length
    $partNum = 0
    $buffer = New-Object byte[] (64 * 1024)  # 64KB read buffer
    
    while ($stream.Position -lt $totalSize) {
        $partHex = $partNum.ToString("X2")
        $chunkName = "ul.$crc.$gameId.$partHex"
        $chunkPath = Join-Path $TargetDrive $chunkName
        
        if (Test-Path $chunkPath) {
            Write-Host "  SKIP chunk (exists): $chunkName" -ForegroundColor DarkGray
            # Advance stream position
            $remaining = [math]::Min($ChunkSize, $totalSize - $stream.Position)
            $stream.Seek($remaining, [System.IO.SeekOrigin]::Current) | Out-Null
        } else {
            Write-Host "  Writing chunk: $chunkName ..." -NoNewline
            $outStream = [System.IO.File]::Create($chunkPath)
            $bytesWritten = 0
            
            while ($bytesWritten -lt $ChunkSize -and $stream.Position -lt $totalSize) {
                $toRead = [math]::Min($buffer.Length, [math]::Min($ChunkSize - $bytesWritten, $totalSize - $stream.Position))
                $read = $stream.Read($buffer, 0, $toRead)
                if ($read -eq 0) { break }
                $outStream.Write($buffer, 0, $read)
                $bytesWritten += $read
            }
            
            $outStream.Close()
            Write-Host " OK ($([math]::Round($bytesWritten / 1MB, 0)) MB)" -ForegroundColor Green
        }
        
        $partNum++
    }
    
    $stream.Close()
    
    # Add ul.cfg entry
    Add-UlCfgEntry -UlCfgPath $UlCfg -GameName $gameName -GameID $gameId -Parts $partNum -MediaType 0x14
    
    Write-Host "  Completed: $gameName → $partNum chunks" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Transfer Complete!" -ForegroundColor Green
Write-Host "  Direct copies: $($directCopy.Count)" -ForegroundColor Green
Write-Host "  Split games:   $($needsSplit.Count)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext step: Run 'defrag G: /O' for optimization" -ForegroundColor Yellow
