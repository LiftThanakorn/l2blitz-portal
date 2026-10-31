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
Write-Host 'Slip2Go is manual fallback until SLIP2GO_SECRET_KEY and SLIP2GO_API_URL are explicitly configured in this process.'
Push-Location $website
try { & node (Join-Path $PSScriptRoot 'server.mjs'); if ($LASTEXITCODE -ne 0) { throw 'Local payment server stopped with error' } }
finally { Pop-Location }
