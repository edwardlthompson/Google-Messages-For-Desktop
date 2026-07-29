#Requires -Version 5.1
<#
.SYNOPSIS
  Build Windows Chromium App Host, zip portable, compile Inno installer.
#>
param(
  [switch]$SkipInstaller
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
$Version = $pkg.version
Write-Host "=== release:windows v$Version (Chromium App Host) ==="

foreach ($d in @("dist\Windows_Host", "dist\Windows_Tray_Payload", "dist\Windows_Host_Payload")) {
  if (Test-Path $d) { Remove-Item -Recurse -Force $d }
}

Write-Host "=== build host exe ==="
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "build-host.ps1")
if ($LASTEXITCODE -ne 0) { throw "build-host.ps1 failed with exit $LASTEXITCODE" }

$hostDir = Join-Path $RepoRoot "dist\Windows_Host"
$exe = Join-Path $hostDir "GoogleMessages.exe"
if (-not (Test-Path $exe)) { throw "Host exe missing: $exe" }

Write-Host "=== prepare payload + installer ==="
$installerArgs = @(
  "-NoProfile", "-ExecutionPolicy", "Bypass",
  "-File", (Join-Path $PSScriptRoot "build-installer.ps1"),
  "-AppRoot", "dist/Windows_Host",
  "-Version", $Version
)
if ($SkipInstaller) { $installerArgs += "-SkipCompile" }
$p = Start-Process -FilePath "powershell.exe" -ArgumentList $installerArgs -Wait -PassThru -NoNewWindow
if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 2) {
  throw "build-installer.ps1 failed with exit $($p.ExitCode)"
}
if ($p.ExitCode -eq 2) {
  Write-Warning "Inno Setup not found - portable zip will still be created."
}

$payload = Join-Path $RepoRoot "dist\Windows_Tray_Payload"
if (-not (Test-Path $payload)) {
  $payload = Join-Path $RepoRoot "dist\Windows_Host_Payload"
}
$zipName = "google-messages-windows-host_v$Version.zip"
$zipPath = Join-Path $RepoRoot "dist\$zipName"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($payload, $zipPath)
Write-Host "Portable zip:" $zipPath

Write-Host "=== release:windows complete ==="
Get-ChildItem (Join-Path $RepoRoot "dist") -File | Where-Object { $_.Name -like "*$Version*" } |
  Format-Table Name, Length, LastWriteTime
