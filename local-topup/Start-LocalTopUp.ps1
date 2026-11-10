param([switch]$EnablePilot)
$ErrorActionPreference = 'Stop'
$website = Split-Path -Parent $PSScriptRoot
$root = Split-Path -Parent $website
$game = Join-Path $root 'Lineage2-H5-Solo'
if (-not (Test-Path (Join-Path $game 'server/game/config/Custom/BlitzCoinPaymentStop.flag'))) {
    throw 'Emergency payment-stop marker missing. Refusing to start local pilot.'
}
$env:LOCAL_TOPUP_ENABLED = '1'
$env:LOCAL_TOPUP_GAME_ROOT = $game
$env:LOCAL_TOPUP_ALLOW_ORDERS = if($EnablePilot) { '1' } else { '0' }
$cfg = Join-Path $env:LOCALAPPDATA 'L2Blitz/telegram-worker.json'
if (Test-Path $cfg) { $env:LOCAL_TOPUP_TELEGRAM_CONFIG = $cfg }
Write-Host ('LOCAL WEBSITE: http://127.0.0.1:5173/topup | API: 127.0.0.1:3101 | Orders enabled: '+[bool]$EnablePilot)
$secretFile = Join-Path $env:LOCALAPPDATA 'L2Blitz/slip2go-secret.dpapi'
$urlFile = Join-Path $env:LOCALAPPDATA 'L2Blitz/slip2go-api-url.txt'
if ((Test-Path $secretFile) -and (Test-Path $urlFile)) {
    $secure = Get-Content -LiteralPath $secretFile -Raw | ConvertTo-SecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $env:SLIP2GO_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $env:SLIP2GO_API_URL = (Get-Content -LiteralPath $urlFile -Raw).Trim()
    Write-Host 'Slip2Go Local credential loaded securely for this process (value hidden).'
} else {
    Write-Host 'Slip2Go not configured: Local payments will require manual bank verification.'
}
Push-Location $website
try {
    while ($true) {
        & node (Join-Path $PSScriptRoot 'server.mjs')
        $exit = $LASTEXITCODE
        Write-Warning "Local payment server exited with code $exit. Auto-restarting in 2 seconds..."
        Start-Sleep -Seconds 2
    }
}
finally { Pop-Location }
