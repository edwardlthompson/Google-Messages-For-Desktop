'use strict';

/**
 * Windows tray via PowerShell NotifyIcon (no native Node addons).
 * Communicates with the host through the same named pipe (+ shared token file).
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  APP_NAME,
  dataRoot,
  pipeLeafName,
  pipeTokenPath,
  ensurePipeToken,
} = require('./config');
const log = require('./log');

let trayProc = null;

function trayScript() {
  const leaf = pipeLeafName();
  const tokenFile = pipeTokenPath().replace(/'/g, "''");
  return `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
[System.Windows.Forms.Application]::EnableVisualStyles()

function Get-PipeToken {
  try { return (Get-Content -LiteralPath '${tokenFile}' -Raw).Trim() } catch { return '' }
}

function Send-Cmd($obj) {
  try {
    $tok = Get-PipeToken
    if (-not $tok) { return }
    $obj | Add-Member -NotePropertyName token -NotePropertyValue $tok -Force
    $client = New-Object System.IO.Pipes.NamedPipeClientStream('.', '${leaf}', [System.IO.Pipes.PipeDirection]::InOut)
    $client.Connect(2000)
    $sw = New-Object System.IO.StreamWriter($client)
    $sw.AutoFlush = $true
    $sr = New-Object System.IO.StreamReader($client)
    $sw.WriteLine(($obj | ConvertTo-Json -Compress))
    $null = $sr.ReadLine()
    $sw.Dispose(); $sr.Dispose(); $client.Dispose()
  } catch {}
}

$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Text = '${APP_NAME}'
$notify.Visible = $true
try {
  $notify.Icon = [System.Drawing.SystemIcons]::Application
} catch {}

$menu = New-Object System.Windows.Forms.ContextMenuStrip
$open = $menu.Items.Add('Open Messages')
$open.Add_Click({ Send-Cmd @{ type = 'open' } })
$signout = $menu.Items.Add('Sign out (clear profile)')
$signout.Add_Click({ Send-Cmd @{ type = 'signout' } })
$quit = $menu.Items.Add('Quit')
$quit.Add_Click({ Send-Cmd @{ type = 'quit' }; $notify.Visible = $false; [System.Windows.Forms.Application]::Exit() })
$notify.ContextMenuStrip = $menu
$notify.Add_DoubleClick({ Send-Cmd @{ type = 'open' } })

[System.Windows.Forms.Application]::Run()
`;
}

function startTray() {
  if (process.platform !== 'win32') return null;
  if (trayProc) return trayProc;

  ensurePipeToken();
  const scriptPath = path.join(dataRoot(), 'gmfd-tray.ps1');
  fs.writeFileSync(scriptPath, trayScript(), 'utf8');
  log.info('Starting tray helper', scriptPath);

  trayProc = spawn(
    'powershell.exe',
    [
      '-NoLogo',
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-WindowStyle',
      'Hidden',
      '-File',
      scriptPath,
    ],
    { detached: true, stdio: 'ignore', windowsHide: true },
  );
  trayProc.unref();
  trayProc.on('exit', () => {
    trayProc = null;
  });
  return trayProc;
}

function stopTray() {
  if (!trayProc) return;
  try {
    spawn('taskkill', ['/PID', String(trayProc.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } catch (_) {}
  trayProc = null;
}

module.exports = { startTray, stopTray };
