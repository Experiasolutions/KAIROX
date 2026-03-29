<#
.SYNOPSIS
KAIROS Night Shift Runner

.DESCRIPTION
Invokes the background node logic for unattended execution.
Ensures the system does not sleep while the command is running.
Reads .env explicitly if needed, but primarily relies on context.

.EXAMPLE
.\start-night-shift.ps1 -DryRun
#>

param (
    [switch]$DryRun
)

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host " 🌙 INITIALIZING KAIROS NIGHT SHIFT..." -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# Prevent sleep (WakeLock) temporarily
Write-Host "[SYSTEM] Applying temporary WakeLock to prevent system sleep..." -ForegroundColor DarkGray
$signature = @"
[DllImport("kernel32.dll", CharSet = CharSet.Auto,SetLastError = true)]
public static extern void SetThreadExecutionState(uint esFlags);
"@
$steType = Add-Type -memberDefinition $signature -name "System" -namespace "Win32" -passThru
$steType::SetThreadExecutionState([uint32]2147483651) # ES_CONTINUOUS | ES_SYSTEM_REQUIRED (0x80000003)


# Source the .env if it exists so node has the API keys
if (Test-Path ".env") {
    Write-Host "[ENV] Loading environment variables from .env" -ForegroundColor DarkGray
    foreach ($line in Get-Content ".env") {
        if (![string]::IsNullOrWhiteSpace($line) -and !$line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim().Trim('"')
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

try {
    $command = "node scripts/night-shift-automator.js"
    if ($DryRun) {
        $command += " --dry-run"
    }

    Write-Host "[EXECUTION] Running Node Ordinator..." -ForegroundColor Cyan
    Invoke-Expression $command
    
}
catch {
    Write-Host "[ERROR] Night shift failed: $_" -ForegroundColor Red
}
finally {
    Write-Host "[SYSTEM] Releasing WakeLock. System can now rest." -ForegroundColor DarkGray
    $steType::SetThreadExecutionState([uint32]2147483648) # ES_CONTINUOUS (0x80000000)
}

Write-Host "`nOvernight complete. Good morning." -ForegroundColor Green
