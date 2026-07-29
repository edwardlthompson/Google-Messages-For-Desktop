#Requires -Version 5.1
param(
  [string]$AppRoot = "dist/Windows_Host",
  [string]$Version = "",
  [switch]$SkipCompile
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

if (-not $Version) {
  $pkg = Get-Content (Join-Path $RepoRoot "package.json") -Raw | ConvertFrom-Json
  $Version = $pkg.version
}

$AppRootResolved = Resolve-Path $AppRoot
# Keep legacy payload path name so existing docs/scripts that mention it still work
$payload = Join-Path $RepoRoot "dist\Windows_Tray_Payload"
if (Test-Path $payload) { Remove-Item -Recurse -Force $payload }
New-Item -ItemType Directory -Force -Path $payload | Out-Null

$winDir = Get-ChildItem $AppRootResolved -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'win32' -and $_.Name -notmatch 'template' } |
  Select-Object -First 1

if ($winDir) {
  Write-Host "Using nested app folder:" $winDir.FullName
  Copy-Item -Path (Join-Path $winDir.FullName "*") -Destination $payload -Recurse -Force
} else {
  Write-Host "Using flat host folder:" $AppRootResolved
  Copy-Item -Path (Join-Path $AppRootResolved.Path "*") -Destination $payload -Recurse -Force
}

$exe = Get-ChildItem $payload -Filter "*.exe" -File | Select-Object -First 1
if (-not $exe) { throw "No .exe found in payload $payload" }
Write-Host "Payload exe:" $exe.FullName

# Drop staging leftovers if any
Get-ChildItem $payload -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq '_stage' } |
  Remove-Item -Recurse -Force

if ($SkipCompile) {
  Write-Host "SkipCompile set - payload only."
  exit 0
}

$isccCandidates = @(
  "C:\Program Files\Inno Setup 7\ISCC.exe",
  "C:\Program Files (x86)\Inno Setup 7\ISCC.exe",
  (Join-Path $env:LocalAppData "Programs\Inno Setup 7\ISCC.exe"),
  "C:\Program Files\Inno Setup 6\ISCC.exe",
  "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
  (Join-Path $env:LocalAppData "Programs\Inno Setup 6\ISCC.exe")
)
$iscc = $null
foreach ($c in $isccCandidates) {
  if ($c -and (Test-Path -LiteralPath $c)) { $iscc = $c; break }
}

if (-not $iscc) {
  Write-Warning "Inno Setup (ISCC.exe) not found. Install Inno Setup 6+ from https://jrsoftware.org/isinfo.php (build machine only - end users do not need Inno)."
  Write-Warning "Payload prepared at $payload - re-run with Inno installed to build the Setup EXE."
  exit 2
}

$iss = Join-Path $RepoRoot "packaging\windows\GoogleMessages.iss"
$outDir = Join-Path $RepoRoot "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Write install-info next to payload for InfoAfterFile
@"
Google Messages uses a dedicated Chrome/Edge app window (Google blocks login inside Electron/WebView2).

After install:
1. Open Google Messages from the Start Menu and sign in.
2. Windows Settings → Apps → Default apps → set Google Messages for tel and sms (or open a tel: link and choose this app).

Chrome phone-number clicks use the Windows protocol handler — the app must be registered (installer does this) and selected as default once.
"@ | Set-Content -Path (Join-Path $payload "install-info.txt") -Encoding UTF8

Write-Host "Compiling with:" $iscc
$p = Start-Process -FilePath $iscc -ArgumentList @(
  "/DMyAppVersion=$Version",
  "/DSourceDir=$payload",
  "/DOutputDir=$outDir",
  $iss
) -Wait -PassThru -NoNewWindow

if ($p.ExitCode -ne 0) { throw "ISCC failed with exit $($p.ExitCode)" }

$setup = Join-Path $outDir "GoogleMessagesSetup-$Version.exe"
if (-not (Test-Path $setup)) { throw "Expected installer missing: $setup" }
Write-Host "Installer ready:" $setup
exit 0
