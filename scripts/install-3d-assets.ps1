# L2Blitz 3D artwork installer. Source archive is generated in the ChatGPT conversation.
# This script never modifies GameServer, accounts, or non-artwork files.
[CmdletBinding()]
param(
    [string]$ZipPath = (Join-Path $env:USERPROFILE 'Downloads\L2Blitz_3D_Web_Assets.zip')
)
$ErrorActionPreference = 'Stop'
$expectedZipSha256 = 'df0246aed7a33743adfda595039b6ff95193a88b7b1c201d4c6683dfb9dde44d'
$baseDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$frontendDir = Join-Path $baseDir 'l2blitz-web\frontend'
$assetDir = Join-Path $frontendDir 'public\assets\images'
$names = @('hero-pvp', 'farm-zone', 'raid-bosses', 'olympiad-duel', 'events-tvt', 'server-features')
$extensions = @('.webp', '.png')

if (-not (Test-Path -LiteralPath $ZipPath -PathType Leaf)) {
    throw "Cannot find L2Blitz 3D artwork ZIP at: $ZipPath. Download the ZIP from the ChatGPT conversation to Downloads first."
}
$actualHash = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualHash -ne $expectedZipSha256) {
    throw "Artwork archive SHA256 mismatch. Expected $expectedZipSha256, got $actualHash. Existing website images were not changed."
}
if (-not (Test-Path -LiteralPath $assetDir -PathType Container)) {
    throw "Frontend artwork directory not found: $assetDir"
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$tempDir = Join-Path $env:TEMP "L2Blitz-3D-Install-$stamp"
$backupDir = Join-Path (Join-Path $env:USERPROFILE 'Pictures\L2Blitz-Asset-Backups') $stamp
$replaced = New-Object System.Collections.Generic.List[string]
$buildPassed = $false

try {
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $tempDir -ErrorAction Stop
    foreach ($name in $names) {
        foreach ($ext in $extensions) {
            $source = Join-Path $tempDir ($name + $ext)
            if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
                throw "Incomplete archive; missing $($name + $ext)"
            }
            $bytes = [System.IO.File]::ReadAllBytes($source)
            if ($bytes.Length -lt 1024) { throw "Image too small: $source" }
            if ($ext -eq '.webp') {
                $riff = [Text.Encoding]::ASCII.GetString($bytes, 0, 4)
                $webp = [Text.Encoding]::ASCII.GetString($bytes, 8, 4)
                if ($riff -ne 'RIFF' -or $webp -ne 'WEBP') { throw "Invalid WebP: $source" }
            } else {
                if ($bytes[0] -ne 137 -or $bytes[1] -ne 80 -or $bytes[2] -ne 78 -or $bytes[3] -ne 71) {
                    throw "Invalid PNG: $source"
                }
            }
        }
    }

    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    foreach ($name in $names) {
        foreach ($ext in $extensions) {
            $fileName = $name + $ext
            $destination = Join-Path $assetDir $fileName
            if (Test-Path -LiteralPath $destination -PathType Leaf) {
                Copy-Item -LiteralPath $destination -Destination (Join-Path $backupDir $fileName) -Force
            }
            Copy-Item -LiteralPath (Join-Path $tempDir $fileName) -Destination $destination -Force
            $replaced.Add($fileName)
        }
    }

    Push-Location $frontendDir
    try {
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed (exit $LASTEXITCODE)" }
        $buildPassed = $true
    } finally {
        Pop-Location
    }

    Write-Output "SUCCESS: Installed $($replaced.Count) 3D image files."
    Write-Output "Backup: $backupDir"
    foreach ($name in $names) { Write-Output " - $name.webp / $name.png" }
} catch {
    if (-not $buildPassed -and $replaced.Count -gt 0) {
        foreach ($fileName in $replaced) {
            $backup = Join-Path $backupDir $fileName
            if (Test-Path -LiteralPath $backup -PathType Leaf) {
                Copy-Item -LiteralPath $backup -Destination (Join-Path $assetDir $fileName) -Force
            }
        }
    }
    throw
} finally {
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
}