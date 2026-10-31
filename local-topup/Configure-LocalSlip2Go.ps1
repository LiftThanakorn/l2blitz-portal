$ErrorActionPreference = 'Stop'
# Run locally as the Windows user running L2Blitz. Never share the Secret Key in chat or Git.
$store = Join-Path $env:LOCALAPPDATA 'L2Blitz'
New-Item -ItemType Directory -Path $store -Force | Out-Null
Write-Host 'Slip2Go Local (only) configuration. Paste your REST API Secret Key, input hidden.'
$key = Read-Host 'Slip2Go Secret Key' -AsSecureString
if ($key.Length -lt 12) { throw 'Secret Key appears too short; configuration not saved' }
$endpoint = Read-Host 'Slip2Go API URL from your dashboard (https://.../api/verify-slip/qr-base64/info)'
if ($endpoint -notmatch '^https://([a-z0-9-]+\.)*slip2go\.com(?:/api/verify-slip/qr-base64/info)?/?$') {
    throw 'Unknown/unsafe API host or path. Please use HTTPS Slip2Go API URL shown in your dashboard.'
}
$secretFile = Join-Path $store 'slip2go-secret.dpapi'
$urlFile = Join-Path $store 'slip2go-api-url.txt'
$key | ConvertFrom-SecureString | Set-Content -LiteralPath $secretFile -Encoding ASCII -NoNewline
Set-Content -LiteralPath $urlFile -Value $endpoint -Encoding ASCII -NoNewline
Write-Host 'Local Slip2Go credentials stored with Windows DPAPI for this user only. No secret printed.'
Write-Host 'Restart the LOCAL top-up API to load new settings. Public VPS and Cloudflare remain unchanged.'
