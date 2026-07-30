#Requires -Version 5.1
<#
.SYNOPSIS
  Build the Windows Electron app (electron-builder) and copy artifacts to dist/.
#>
param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$ElectronDir = Join-Path $RepoRoot "electron"
Set-Location $ElectronDir

$pkg = Get-Content (Join-Path $ElectronDir "package.json") -Raw | ConvertFrom-Json
$Version = $pkg.version
Write-Host "=== release:windows (Electron) v$Version ==="

if (-not $SkipInstall) {
  Write-Host "=== npm install ==="
  npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit $LASTEXITCODE" }
}

Write-Host "=== webpack + electron-builder (win) ==="
npm run package:win
if ($LASTEXITCODE -ne 0) { throw "electron-builder failed with exit $LASTEXITCODE" }

$outDir = Join-Path $ElectronDir "dist"
$destDir = Join-Path $RepoRoot "dist"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

Get-ChildItem $outDir -File | Where-Object {
  $_.Name -match "Google Messages|GoogleMessages|\.exe$|\.zip$"
} | ForEach-Object {
  $dest = Join-Path $destDir $_.Name
  Copy-Item -Force $_.FullName $dest
  Write-Host "Copied" $_.Name "->" $dest
}

Write-Host "=== release:windows (Electron) complete ==="
Get-ChildItem $destDir -File | Where-Object { $_.Name -like "*$Version*" -or $_.Name -like "*Google*" } |
  Format-Table Name, Length, LastWriteTime
