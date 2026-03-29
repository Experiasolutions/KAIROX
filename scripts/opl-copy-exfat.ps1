$ErrorActionPreference = "Stop"
Write-Host "Starting ISO Transfers to exFAT G: Drive (Total ~21GB)..."

$games = @(
    "E:\GOD OF WAR 2 PTBR V4.3.iso",
    "E:\Jak 3 (PT) (www.romsportugues.com).iso",
    "E:\Midnight Club 3 - DUB Edition Remix (Europe, Australia) (En,Fr,De,Es,It).iso"
)

foreach($g in $games) {
    if (Test-Path $g) {
        $name = Split-Path $g -Leaf
        Write-Host "Copying $name to G:\DVD ..."
        Copy-Item $g -Destination "G:\DVD" -Force
        Write-Host "Done copying $name" -ForegroundColor Green
    } else {
        Write-Host "FILE NOT FOUND: $g" -ForegroundColor Red
    }
}

Write-Host "All transfers complete."
