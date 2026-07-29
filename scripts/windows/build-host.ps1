#Requires -Version 5.1
<#
.SYNOPSIS
  Package host/windows into dist/Windows_Host/GoogleMessages.exe via pkg
#>
param(
  [switch]$SkipPkg
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$Version = $pkg.version
Write-Host "=== build-host v$Version ==="

$outDir = Join-Path $RepoRoot "dist\Windows_Host"
$HostExeName = "GoogleMessages.exe"
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Stage sources (pkg needs a clean entry)
$stage = Join-Path $outDir "_stage"
New-Item -ItemType Directory -Force -Path $stage | Out-Null
Copy-Item -Recurse -Force (Join-Path $RepoRoot "host\windows\src") (Join-Path $stage "src")
$pkgJson = @"
{
  "name": "google-messages-windows-host",
  "version": "$Version",
  "private": true,
  "bin": "src/index.js",
  "pkg": {
    "targets": ["node20-win-x64"],
    "outputPath": "..",
    "assets": ["src/vendor/**/*"]
  }
}
"@
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $stage "package.json"), $pkgJson, $utf8NoBom)

if ($SkipPkg) {
  Write-Host "SkipPkg: staged sources at $stage"
  exit 0
}

Write-Host "Packaging with pkg (node20-win-x64)..."
Push-Location $stage
try {
  # No spaces in EXE name — required for Win11 SMS default-app picker indexing
  & npx --yes @yao-pkg/pkg@5.16.1 . --targets node20-win-x64 --output "..\$HostExeName"
  if ($LASTEXITCODE -ne 0) { throw "pkg failed with exit $LASTEXITCODE" }
} finally {
  Pop-Location
}

$exe = Join-Path $outDir $HostExeName
if (-not (Test-Path $exe)) { throw "Expected exe missing: $exe" }

# Patch PE subsystem CONSOLE(3) -> WINDOWS(2) so launching never flashes a terminal
function Set-GuiSubsystem([string]$ExePath) {
  $bytes = [System.IO.File]::ReadAllBytes($ExePath)
  $pe = [BitConverter]::ToInt32($bytes, 0x3C)
  if ([Text.Encoding]::ASCII.GetString($bytes, $pe, 4) -ne "PE`0`0") {
    throw "Not a PE file: $ExePath"
  }
  $opt = $pe + 24
  $magic = [BitConverter]::ToUInt16($bytes, $opt)
  if ($magic -ne 0x20B -and $magic -ne 0x10B) {
    throw "Unknown optional header magic 0x$('{0:X}' -f $magic)"
  }
  $subOff = $opt + 0x44
  $sub = [BitConverter]::ToUInt16($bytes, $subOff)
  if ($sub -eq 2) {
    Write-Host "EXE already GUI subsystem"
    return
  }
  $bytes[$subOff] = 2
  $bytes[$subOff + 1] = 0
  [System.IO.File]::WriteAllBytes($ExePath, $bytes)
  Write-Host "Patched EXE subsystem -> WINDOWS (no console window)"
}
Set-GuiSubsystem $exe

# Optional icon via rcedit if available and ico is small
$ico = Join-Path $RepoRoot "google-messages-logo.ico"
if ((Test-Path $ico) -and ((Get-Item $ico).Length -lt 200KB)) {
  Write-Host "Applying icon with rcedit..."
  & npx --yes rcedit@4.0.1 "$exe" --set-icon "$ico" --set-version-string ProductName "Google Messages" --set-file-version $Version --set-product-version $Version
  if ($LASTEXITCODE -ne 0) { Write-Warning "rcedit failed; continuing with default icon" }
}

# Cleanup stage (keep exe only + readme)
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

@"
Google Messages for Desktop (Windows Chromium App Host)

This EXE registers sms:/tel: and opens Messages in a dedicated Chrome/Edge app window.
Requires Google Chrome or Microsoft Edge installed.

Log: %LOCALAPPDATA%\GoogleMessages\gmfd-host.log
Profile: %LOCALAPPDATA%\GoogleMessages\chromium-profile
"@ | Set-Content -Path (Join-Path $outDir "README.txt") -Encoding UTF8

Write-Host "Host ready:" $exe
Get-Item $exe | Format-List FullName, Length, LastWriteTime
