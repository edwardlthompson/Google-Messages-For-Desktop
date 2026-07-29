'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  MESSAGES_URL,
  APP_NAME,
  APP_USER_MODEL_ID,
  profileDir,
  dataRoot,
  hostExePath,
  getCdpPort,
  allocateCdpPort,
  sanitizeMessagesUrl,
} = require('./config');
const cdp = require('./cdp');
const log = require('./log');

function findBrowser() {
  const candidates = [
    process.env.GMFD_BROWSER,
    path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (_) {}
  }
  return null;
}

/** chrome_proxy.exe / msedge_proxy.exe — required so pins don't use the Chrome browser icon/name. */
function findBrowserProxy(browserPath) {
  if (!browserPath) return null;
  const dir = path.dirname(browserPath);
  const base = path.basename(browserPath).toLowerCase();
  const proxyName =
    base === 'msedge.exe' ? 'msedge_proxy.exe' : 'chrome_proxy.exe';
  const proxy = path.join(dir, proxyName);
  return fs.existsSync(proxy) ? proxy : null;
}

async function cdpReachable() {
  return cdp.waitForCdp(getCdpPort(), 4);
}

function identityPath() {
  return path.join(dataRoot(), 'chrome-app-identity.json');
}

function loadIdentity() {
  try {
    const p = identityPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

function saveIdentity(partial) {
  const prev = loadIdentity() || {};
  const next = { ...prev, ...partial, at: new Date().toISOString() };
  fs.writeFileSync(identityPath(), JSON.stringify(next, null, 2));
  return next;
}

function discoverInstalledAppId() {
  // ONLY trust Chrome's Web Applications install tree — Preferences also contain
  // synced extension IDs (32-char) that must never be used as --app-id.
  const roots = [
    path.join(profileDir(), 'Default', 'Web Applications'),
    path.join(profileDir(), 'Web Applications'),
  ];
  for (const root of roots) {
    try {
      if (!fs.existsSync(root)) continue;
      for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
        if (!ent.isDirectory()) continue;
        const id = ent.name;
        if (!/^[a-z]{32}$/i.test(id) && !/^[A-Za-z0-9_-]{16,}$/.test(id)) continue;
        try {
          for (const f of fs.readdirSync(path.join(root, id))) {
            if (!/manifest/i.test(f) && !/\.webmanifest$/i.test(f) && f !== 'Manifest.json') {
              continue;
            }
            const raw = fs.readFileSync(path.join(root, id, f), 'utf8');
            if (/messages\.google\.com/i.test(raw)) {
              return { appId: id, source: root };
            }
          }
        } catch (_) {
          /* ignore */
        }
      }
    } catch (_) {
      /* ignore */
    }
  }
  return null;
}

function chromeArgs(url, identity, cdpPort) {
  const profile = profileDir();
  const port = cdpPort || getCdpPort();
  const safeUrl = sanitizeMessagesUrl(url) || MESSAGES_URL;
  const args = [
    `--remote-debugging-port=${port}`,
    `--remote-debugging-address=127.0.0.1`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-features=DeviceBoundSessions,DeviceBoundSessionCredentials',
  ];
  const appId = identity && identity.appId;
  if (appId) {
    // Installed web app — more stable taskbar identity than raw --app=URL
    args.push(`--app-id=${appId}`);
    args.push('--profile-directory=Default');
  } else {
    args.push(`--app=${safeUrl}`);
  }
  return args;
}

function vendorScript(name) {
  return path.join(__dirname, 'vendor', name);
}

function materializeVendor(name) {
  const src = vendorScript(name);
  const body = fs.readFileSync(src, 'utf8');
  const dest = path.join(dataRoot(), name);
  fs.writeFileSync(dest, body, 'utf8');
  return dest;
}

function readLiveWindowAumid() {
  let script;
  try {
    script = materializeVendor('read-window-aumid.ps1');
  } catch (err) {
    log.warn('read-window-aumid.ps1 missing', String(err));
    return null;
  }
  const r = spawnSync(
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
      script,
      '-TitleMatch',
      'Messages',
      '-CommandLineMatch',
      profileDir(),
    ],
    { encoding: 'utf8', windowsHide: true, timeout: 20000 },
  );
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  const m = /^AUMID_OK\s+(.+)$/m.exec(out);
  if (m) return m[1].trim();
  log.warn('Could not read live window AUMID', out || String(r.status));
  return null;
}

function ensureAppShortcut(launchExe, browserPath, url, identity, cdpPort) {
  const args = chromeArgs(url, identity, cdpPort).join(' ');
  const lnk = path.join(dataRoot(), 'Google Messages App.lnk');
  const host = hostExePath();
  const icon = `${host},0`;
  const relaunch = `"${host}" --open`;
  const aumid = (identity && identity.aumid) || APP_USER_MODEL_ID;

  let scriptOut;
  try {
    scriptOut = materializeVendor('create-app-shortcut.ps1');
  } catch (err) {
    log.warn('create-app-shortcut.ps1 missing', String(err));
    return null;
  }

  const r = spawnSync(
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
      scriptOut,
      '-ShortcutPath',
      lnk,
      '-BrowserPath',
      launchExe,
      '-Arguments',
      args,
      '-WorkingDirectory',
      path.dirname(browserPath),
      '-IconLocation',
      icon,
      '-Description',
      APP_NAME,
      '-AppUserModelId',
      aumid,
      '-RelaunchCommand',
      relaunch,
      '-RelaunchDisplayName',
      APP_NAME,
    ],
    { encoding: 'utf8', windowsHide: true, timeout: 30000 },
  );
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  if (!fs.existsSync(lnk)) {
    log.warn('App shortcut was not created', out);
    return null;
  }
  if (/AUMID_OK/.test(out)) {
    log.info('App shortcut ready', { lnk, aumid, launchExe: path.basename(launchExe) });
  } else {
    log.warn('App shortcut created but AUMID may be missing', out);
  }

  // Start Menu entry → host (tray / protocols), not Chrome
  try {
    const programs = path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
    );
    fs.mkdirSync(programs, { recursive: true });
    const hostLnk = path.join(programs, `${APP_NAME}.lnk`);
    const ps = `
$W = New-Object -ComObject WScript.Shell
$S = $W.CreateShortcut(${JSON.stringify(hostLnk)})
$S.TargetPath = ${JSON.stringify(host)}
$S.WorkingDirectory = ${JSON.stringify(path.dirname(host))}
$S.Description = ${JSON.stringify(APP_NAME)}
$S.IconLocation = ${JSON.stringify(icon)}
$S.Save()
`;
    spawnSync(
      'powershell.exe',
      [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-WindowStyle',
        'Hidden',
        '-Command',
        ps,
      ],
      { windowsHide: true },
    );
  } catch (_) {
    /* ignore */
  }

  return lnk;
}

function launchAppWindow(browserPath, url, identity, cdpPort) {
  const proxy = findBrowserProxy(browserPath);
  const launchExe = proxy || browserPath;
  if (!proxy) {
    log.warn('chrome_proxy/msedge_proxy not found; pins may show as Chrome');
  }

  const lnk = ensureAppShortcut(launchExe, browserPath, url, identity, cdpPort);
  if (lnk) {
    spawnSync(
      'powershell.exe',
      [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-WindowStyle',
        'Hidden',
        '-Command',
        `Start-Process -FilePath ${JSON.stringify(lnk)}`,
      ],
      { windowsHide: true },
    );
    return { via: 'shortcut', lnk, launchExe };
  }

  const child = spawn(launchExe, chromeArgs(url, identity, cdpPort), {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  return { via: 'spawn', pid: child.pid, launchExe };
}

async function syncIdentityAfterLaunch(browserPath, url) {
  // Chrome sets System.AppUserModel.ID shortly after the app window appears.
  let liveAumid = null;
  for (let i = 0; i < 8 && !liveAumid; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 1500 : 750));
    liveAumid = readLiveWindowAumid();
  }
  const installed = discoverInstalledAppId();
  const prev = loadIdentity() || {};
  const next = {
    aumid: liveAumid || prev.aumid || null,
    appId: (installed && installed.appId) || prev.appId || null,
    proxy: findBrowserProxy(browserPath),
    browserPath,
    appUrl: url || MESSAGES_URL,
  };
  saveIdentity(next);

  if (liveAumid && liveAumid !== prev.aumid) {
    log.info('Synced Chrome window AUMID into app shortcut', { aumid: liveAumid });
    ensureAppShortcut(next.proxy || browserPath, browserPath, url, next);
  } else if (liveAumid && prev.aumid === liveAumid) {
    // Ensure shortcut stays on chrome_proxy + current args even if AUMID unchanged
    ensureAppShortcut(next.proxy || browserPath, browserPath, url, next);
  } else if (installed && installed.appId && installed.appId !== prev.appId) {
    log.info('Discovered installed web app id', installed);
    ensureAppShortcut(next.proxy || browserPath, browserPath, url, next);
  }
  return next;
}

async function ensureBrowser(url = MESSAGES_URL) {
  const browserPath = findBrowser();
  if (!browserPath) {
    throw new Error(
      'Google Chrome or Microsoft Edge not found. Install Chrome to run Google Messages.',
    );
  }

  const safeUrl = sanitizeMessagesUrl(url) || MESSAGES_URL;

  let identity = loadIdentity() || {};
  // Drop stale/wrong app ids (e.g. synced extension ids from an older bug)
  const discovered = discoverInstalledAppId();
  if (discovered && discovered.appId) {
    identity = { ...identity, appId: discovered.appId };
  } else if (identity.appId) {
    log.warn('Ignoring stored appId (not a Messages web app install)', { appId: identity.appId });
    identity = { ...identity, appId: null };
    saveIdentity({ appId: null });
  }

  if (await cdpReachable()) {
    const port = getCdpPort();
    log.info('Chromium app already running (CDP up)', { port });
    try {
      const pages = await cdp.listPages(port);
      const onMessages = pages.some((p) => /messages\.google\.com/i.test(p.url || ''));
      if (!onMessages) {
        await cdp.navigate(safeUrl, port);
      }
      await cdp.focusMessagesWindow(port);
      await syncIdentityAfterLaunch(browserPath, safeUrl);
    } catch (err) {
      log.warn('CDP focus/navigate failed', String(err));
    }
    return { browserPath, reused: true };
  }

  const cdpPort = await allocateCdpPort();
  log.info('Starting Chromium app shell', {
    browserPath,
    proxy: findBrowserProxy(browserPath),
    appId: identity.appId || null,
    url: safeUrl,
    cdpPort,
  });
  let launched = launchAppWindow(browserPath, safeUrl, identity, cdpPort);

  let ok = await cdp.waitForCdp(cdpPort, 80);
  if (!ok && identity.appId) {
    log.warn('CDP not ready with --app-id; falling back to --app=URL');
    killBrowserProfileProcesses();
    await new Promise((r) => setTimeout(r, 500));
    identity = { ...identity, appId: null };
    saveIdentity({ appId: null });
    launched = launchAppWindow(browserPath, safeUrl, identity, cdpPort);
    ok = await cdp.waitForCdp(cdpPort, 80);
  }
  if (!ok) {
    throw new Error('Chromium started but CDP did not become ready');
  }
  const synced = await syncIdentityAfterLaunch(browserPath, safeUrl);
  log.info('Chromium app shell ready', {
    ...launched,
    aumid: synced.aumid,
    appId: synced.appId,
    cdpPort,
  });
  return { browserPath, reused: false, ...launched, identity: synced };
}

function killBrowserProfileProcesses() {
  const profile = profileDir();
  const ps = `
$profile = ${JSON.stringify(profile)}
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    ($_.Name -eq 'chrome.exe' -or $_.Name -eq 'msedge.exe' -or $_.Name -eq 'chrome_proxy.exe' -or $_.Name -eq 'msedge_proxy.exe') -and
    $_.CommandLine -and ($_.CommandLine.IndexOf($profile) -ge 0)
  } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
`;
  spawnSync(
    'powershell.exe',
    [
      '-NoLogo',
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-WindowStyle',
      'Hidden',
      '-Command',
      ps,
    ],
    { windowsHide: true },
  );
}

async function clearProfile() {
  killBrowserProfileProcesses();
  await new Promise((r) => setTimeout(r, 800));
  const dir = profileDir();
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    try {
      fs.unlinkSync(identityPath());
    } catch (_) {}
    log.info('Cleared Chromium profile (signed out)');
  } catch (err) {
    log.error('Failed to clear profile', String(err));
    throw err;
  }
}

module.exports = {
  findBrowser,
  findBrowserProxy,
  ensureBrowser,
  clearProfile,
  killBrowserProfileProcesses,
  cdpReachable,
  loadIdentity,
  readLiveWindowAumid,
};
