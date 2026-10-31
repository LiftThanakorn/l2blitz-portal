$ErrorActionPreference = 'Stop'
# Windows-user DPAPI encryption. No API key is written to the project or Git.
$store = Join-Path $env:LOCALAPPDATA 'L2Blitz'
New-Item -ItemType Directory -Path $store -Force | Out-Null
Write-Host 'L2Blitz Local Slip2Go REST API Configuration'
Write-Host 'This system submits a base64-encoded receipt, NOT multipart image or QR-code string.'
Write-Host 'Official API endpoint: https://connect.slip2go.com/api/verify-slip/qr-base64/info'
Write-Host 'Paste the API Secret Key from Slip2Go > API Connect > Authentication. Input is hidden.'
$key = Read-Host 'Slip2Go Secret Key' -AsSecureString
if ($key.Length -lt 12) { throw 'Secret Key appears too short; configuration not saved' }
$secretFile = Join-Path $store 'slip2go-secret.dpapi'
$urlFile = Join-Path $store 'slip2go-api-url.txt'
# Use a fixed official HTTPS host and the base64 route so QR-image URLs cannot be mistaken for the request type.
$endpoint = 'https://connect.slip2go.com/api/verify-slip/qr-base64/info'
$key | ConvertFrom-SecureString | Set-Content -LiteralPath $secretFile -Encoding ASCII -NoNewline
Set-Content -LiteralPath $urlFile -Value $endpoint -Encoding ASCII -NoNewline
Write-Host 'Saved: Windows-user DPAPI encrypted Secret Key and Base64 endpoint.'
Write-Host 'Restart only the LOCAL Node top-up service to load the updated settings.'
Write-Host 'VPS and Cloudflare are untouched.'
