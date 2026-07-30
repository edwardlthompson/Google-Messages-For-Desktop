/**
 * External Chrome/Edge sign-in for Google Messages.
 *
 * Google rejects Electron login and cookie import into Electron still yields a
 * blank Messages SPA (device-bound session / missing browser state). After a
 * successful real-browser login we keep using that Chrome/Edge profile in
 * --app mode; Electron owns tray + sms:/tel: and a small status window.
 *
 * Copied into the packaged app as resources/app/lib/gmfd-browser-auth.js
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const net = require('net');

const LOGIN_URL =
  'https://accounts.google.com/ServiceLogin?passive=1209600&osid=1&continue=https://messages.google.com/web/u/0/postSignIn&followup=https://messages.google.com/web/&ec=GAZA-AM';
const MESSAGES_URL = 'https://messages.google.com/web/conversations';
const SUCCESS_HOST = 'messages.google.com';
const REQUIRED_COOKIE_NAMES = ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID'];
const STATE_FILE = 'gmfd-chrome-shell.json';
const LOG_FILE = 'gmfd-auth.log';

let active = null;
let fileLogPath = null;

function logToFile(level, msg, extra) {
  if (!fileLogPath) return;
  try {
    const line = `${new Date().toISOString()} [${level}] ${msg}${extra ? ` ${JSON.stringify(extra)}` : ''}\n`;
    fs.appendFileSync(fileLogPath, line, 'utf8');
  } catch (_) {}
}

function wrapLog(log) {
  return {
    info: (m, e) => {
      logToFile('info', m, e);
      if (log && log.info) log.info(m, e);
    },
    warn: (m, e) => {
      logToFile('warn', m, e);
      if (log && log.warn) log.warn(m, e);
    },
    error: (m, e) => {
      logToFile('error', m, e);
      if (log && log.error) log.error(m, e);
    },
    debug: (m, e) => {
      logToFile('debug', m, e);
      if (log && log.debug) log.debug(m, e);
    },
  };
}

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

function profileDirFor(app) {
  return path.join(app.getPath('userData'), 'gmfd-browser-login');
}

function statePathFor(app) {
  return path.join(app.getPath('userData'), STATE_FILE);
}

function readState(app) {
  try {
    return JSON.parse(fs.readFileSync(statePathFor(app), 'utf8'));
  } catch (_) {
    return null;
  }
}

function writeState(app, state) {
  fs.writeFileSync(statePathFor(app), JSON.stringify(state, null, 2), 'utf8');
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function maskFrame(opcode, data) {
  const maskKey = crypto.randomBytes(4);
  const masked = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ maskKey[i % 4];
  let header;
  if (data.length < 126) {
    header = Buffer.alloc(6);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | data.length;
    maskKey.copy(header, 2);
  } else if (data.length < 65536) {
    header = Buffer.alloc(8);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(data.length, 2);
    maskKey.copy(header, 4);
  } else {
    header = Buffer.alloc(14);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
    maskKey.copy(header, 10);
  }
  return Buffer.concat([header, masked]);
}

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Version': '13',
          'Sec-WebSocket-Key': key,
        },
      },
      () => {},
    );
    req.on('upgrade', (_res, socket) => resolve(makeWs(socket)));
    req.on('error', reject);
    req.end();
  });
}

function makeWs(socket) {
  let buf = Buffer.alloc(0);
  let nextId = 0;
  const pending = new Map();
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= 2) {
      const b0 = buf[0];
      const b1 = buf[1];
      const opcode = b0 & 0xf;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        off = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        len = Number(buf.readBigUInt64BE(2));
        off = 10;
      }
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      let payload = buf.subarray(off + maskLen, off + maskLen + len);
      if (masked) {
        const mk = buf.subarray(off, off + 4);
        payload = Buffer.from(payload);
        for (let i = 0; i < payload.length; i++) payload[i] ^= mk[i % 4];
      }
      buf = buf.subarray(off + maskLen + len);
      if (opcode === 0x1) {
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          if (msg.id && pending.has(msg.id)) {
            const p = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
            else p.resolve(msg.result);
          }
        } catch (_) {}
      }
    }
  });
  function send(method, params = {}) {
    const id = ++nextId;
    socket.write(maskFrame(0x1, Buffer.from(JSON.stringify({ id, method, params }), 'utf8')));
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`timeout ${method}`));
      }, 15000);
      pending.set(id, {
        resolve: (v) => {
          clearTimeout(t);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(t);
          reject(e);
        },
      });
    });
  }
  return { send, close: () => socket.end() };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cookieLooksReady(cookies) {
  const byName = new Map();
  for (const c of cookies) {
    if (!/google\.com$/i.test(c.domain || '')) continue;
    byName.set(c.name, c);
  }
  return REQUIRED_COOKIE_NAMES.filter((n) => byName.has(n)).length >= 4;
}

async function fetchBrowserCookies(debugPort) {
  const version = await getJson(`http://127.0.0.1:${debugPort}/json/version`);
  const wsUrl = version.webSocketDebuggerUrl;
  if (!wsUrl) throw new Error('No browser debugger URL');
  const ws = await wsConnect(wsUrl);
  try {
    try {
      const all = await ws.send('Network.getAllCookies');
      if (all && Array.isArray(all.cookies)) return all.cookies;
    } catch (_) {}
    return [];
  } finally {
    ws.close();
  }
}

async function browserMessagesUiReady(debugPort) {
  try {
    const tabs = await getJson(`http://127.0.0.1:${debugPort}/json`);
    return tabs.some((t) => {
      if (t.type !== 'page' || !t.url) return false;
      let host = '';
      try {
        host = new URL(t.url).hostname.toLowerCase();
      } catch (_) {
        return false;
      }
      // Exact host or subdomain of messages.google.com (not substring of path/query)
      if (host !== SUCCESS_HOST && !host.endsWith(`.${SUCCESS_HOST}`)) return false;
      if (host === 'accounts.google.com' || host.endsWith('.accounts.google.com')) return false;
      if (/\/welcome/i.test(t.url)) return false;
      if (/conversations/i.test(t.url)) return true;
      if (/Conversations/i.test(t.title || '')) return true;
      if (/Google Messages for web/i.test(t.title || '') && /\/web\/u\//i.test(t.url)) return true;
      return false;
    });
  } catch (_) {
    return false;
  }
}

function killProcessTree(pid, log) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGTERM');
    }
  } catch (err) {
    if (log) log.warn('Failed to stop browser', err);
  }
}

function openChromeApp(app, log, url = MESSAGES_URL) {
  const browserPath = findBrowser();
  if (!browserPath) throw new Error('Chrome/Edge not found');
  const profileDir = profileDirFor(app);
  fs.mkdirSync(profileDir, { recursive: true });
  const args = [
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=DeviceBoundSessions,DeviceBoundSessionCredentials',
    `--app=${url}`,
  ];
  log.info('Opening Chrome app shell for Messages', { browserPath, url });
  const child = spawn(browserPath, args, { detached: true, stdio: 'ignore' });
  child.unref();
  return child.pid;
}

function statusHtml() {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Google Messages</title>
<style>
  body{font-family:Segoe UI,system-ui,sans-serif;margin:0;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center}
  .card{max-width:440px;padding:28px;border-radius:14px;background:#1e293b;box-shadow:0 16px 40px rgba(0,0,0,.35)}
  h1{font-size:20px;margin:0 0 10px}
  p{line-height:1.45;color:#cbd5e1;margin:0 0 18px}
  button{appearance:none;border:0;border-radius:8px;padding:10px 14px;font-weight:600;cursor:pointer;margin:0 8px 8px 0}
  .primary{background:#0b57d0;color:#fff}
  .secondary{background:#334155;color:#fff}
</style></head>
<body><div class="card">
  <h1>Messages is running in Chrome</h1>
  <p>Google blocks sign-in inside this Electron window, and copying the session cookies still leaves a blank page. Your signed-in Chrome profile is the working Messages UI.</p>
  <p>This window keeps the tray icon and <code>sms:</code>/<code>tel:</code> handlers. Use the button below if Messages is not visible.</p>
  <button class="primary" id="open">Open Messages window</button>
  <button class="secondary" id="resign">Sign in again</button>
</div>
<script>
  const {ipcRenderer}=require('electron');
  document.getElementById('open').onclick=()=>ipcRenderer.invoke('gmfd-open-chrome-shell');
  document.getElementById('resign').onclick=()=>ipcRenderer.invoke('gmfd-browser-signin');
</script>
</body></html>`;
}

async function showStatusWindow(getMainWindow, log) {
  const win = getMainWindow && getMainWindow();
  if (!win || win.isDestroyed()) return;
  const htmlPath = path.join(require('os').tmpdir(), 'gmfd-messages-status.html');
  fs.writeFileSync(htmlPath, statusHtml(), 'utf8');
  try {
    await win.loadFile(htmlPath);
  } catch (err) {
    log.warn('loadFile status failed, using data URL', err);
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(statusHtml()));
  }
  win.show();
  win.focus();
}

async function startBrowserSignIn(opts) {
  const { getMainWindow, dialog, app } = opts;
  const log = wrapLog(opts.log || console);
  fileLogPath = path.join(app.getPath('userData'), LOG_FILE);

  if (active) {
    if (dialog) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'Sign-in already in progress',
        message: 'Finish signing in with the Chrome/Edge window that already opened, or wait for it to finish.',
      });
    }
    return { ok: false, reason: 'busy' };
  }

  const browserPath = findBrowser();
  if (!browserPath) {
    if (dialog) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Browser not found',
        message: 'Install Google Chrome or Microsoft Edge to sign in. Google blocks sign-in inside this app.',
      });
    }
    return { ok: false, reason: 'no-browser' };
  }

  const profileDir = profileDirFor(app);
  fs.mkdirSync(profileDir, { recursive: true });
  const debugPort = await getFreePort();

  const args = [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=DeviceBoundSessions,DeviceBoundSessionCredentials',
    LOGIN_URL,
  ];

  log.info('Starting external browser sign-in', { browserPath, debugPort, profileDir });
  const child = spawn(browserPath, args, { detached: true, stdio: 'ignore' });
  child.unref();
  active = { pid: child.pid, debugPort, cancelled: false };

  if (dialog) {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Sign in with Chrome / Edge',
        message:
          'A real browser window opened for Google sign-in.\n\n' +
          '1. Sign in with your Google account (passkey/password is fine there).\n' +
          '2. Wait until you can see your Messages conversations.\n' +
          '3. This app will then open Messages in a Chrome app window (cookie import into Electron stays blank).\n\n' +
          'Leave that browser open until conversations appear.',
        buttons: ['OK', 'Cancel sign-in'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 1 && active) {
          active.cancelled = true;
          killProcessTree(active.pid, log);
        }
      })
      .catch(() => {});
  }

  const deadline = Date.now() + 15 * 60 * 1000;
  let lastCookieCount = 0;
  try {
    while (Date.now() < deadline) {
      if (!active || active.cancelled) return { ok: false, reason: 'cancelled' };
      await sleep(2500);
      let cookies = [];
      try {
        cookies = await fetchBrowserCookies(debugPort);
      } catch (_) {
        continue;
      }
      lastCookieCount = cookies.length;
      const cookiesReady = cookieLooksReady(cookies);
      const uiReady = await browserMessagesUiReady(debugPort);
      log.info('Sign-in poll', { lastCookieCount, cookiesReady, uiReady });

      // Require the Messages UI, not cookies alone (cookies-only → blank Electron SPA).
      if (uiReady && cookiesReady) {
        writeState(app, {
          ready: true,
          browserPath,
          profileDir,
          updatedAt: new Date().toISOString(),
          mode: 'chrome-app',
        });
        killProcessTree(child.pid, log);
        await sleep(1200);
        openChromeApp(app, log, MESSAGES_URL);
        await showStatusWindow(getMainWindow, log);
        if (dialog) {
          await dialog.showMessageBox({
            type: 'info',
            title: 'Messages ready',
            message:
              'Sign-in worked in Chrome. Messages is opening in a Chrome app window.\n\n' +
              'The Electron window stays for tray / sms: / tel: — Google’s web app stays blank if we only copy cookies.',
          });
        }
        return { ok: true, mode: 'chrome-app' };
      }
    }
    killProcessTree(child.pid, log);
    if (dialog) {
      await dialog.showMessageBox({
        type: 'warning',
        title: 'Sign-in timed out',
        message: `Did not detect Messages conversations (cookies seen: ${lastCookieCount}). Open File → Sign in with browser… and wait until conversations are visible.`,
      });
    }
    return { ok: false, reason: 'timeout' };
  } catch (err) {
    log.error('Browser sign-in failed', String(err && err.stack ? err.stack : err));
    killProcessTree(child.pid, log);
    if (dialog) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Sign-in failed',
        message: String((err && err.message) || err),
      });
    }
    return { ok: false, reason: 'error', error: String(err) };
  } finally {
    active = null;
  }
}

function install(opts) {
  const { electron, getMainWindow } = opts;
  const log = wrapLog(opts.log || console);
  const { app, dialog, ipcMain, Menu } = electron;

  fileLogPath = path.join(app.getPath('userData'), LOG_FILE);

  const run = () =>
    startBrowserSignIn({
      getMainWindow,
      dialog,
      app,
      log,
    });

  const openShell = async () => {
    try {
      openChromeApp(app, log, MESSAGES_URL);
      await showStatusWindow(getMainWindow, log);
      return { ok: true };
    } catch (err) {
      log.error('open chrome shell failed', String(err));
      return { ok: false, error: String(err) };
    }
  };

  app.whenReady().then(async () => {
    try {
      ipcMain.handle('gmfd-browser-signin', () => run());
      ipcMain.handle('gmfd-open-chrome-shell', () => openShell());
    } catch (err) {
      log.warn('ipc install', err);
    }

    try {
      const current = Menu.getApplicationMenu();
      const items = [
        { label: 'Open Messages window', click: () => openShell() },
        { label: 'Sign in with browser…', click: () => run() },
      ];
      if (current) {
        const template = current.items.map((item) => ({
          label: item.label,
          role: item.role,
          type: item.type,
          submenu: item.submenu
            ? item.submenu.items.map((s) => ({
                label: s.label,
                role: s.role,
                type: s.type,
                accelerator: s.accelerator,
                click: s.click,
                enabled: s.enabled,
              }))
            : undefined,
        }));
        let file = template.find((t) => /file/i.test(t.label || ''));
        if (!file) {
          template.unshift({ label: 'File', submenu: [] });
          file = template[0];
        }
        file.submenu = file.submenu || [];
        file.submenu.unshift(...items, { type: 'separator' });
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
      } else {
        Menu.setApplicationMenu(
          Menu.buildFromTemplate([
            { label: 'File', submenu: [...items, { type: 'separator' }, { role: 'quit' }] },
          ]),
        );
      }
    } catch (err) {
      log.warn('Menu install failed', err);
    }

    // If we already have a signed-in Chrome profile, recover from blank Electron SPA.
    const state = readState(app);
    const profileDir = profileDirFor(app);
    if ((state && state.ready) || fs.existsSync(path.join(profileDir, 'Default'))) {
      const cookiesDb = path.join(profileDir, 'Default', 'Network', 'Cookies');
      const cookiesAlt = path.join(profileDir, 'Default', 'Cookies');
      if (fs.existsSync(cookiesDb) || fs.existsSync(cookiesAlt) || (state && state.ready)) {
        log.info('Existing Chrome login profile detected; opening app shell');
        setTimeout(() => {
          openShell().catch(() => {});
        }, 800);
      }
    }
  });

  function attachWindow(win) {
    if (!win || win.__gmfdBrowserAuthAttached) return;
    win.__gmfdBrowserAuthAttached = true;
    const maybeIntercept = (event, url) => {
      if (!url) return;
      if (/accounts\.google\.com/i.test(url) && !/ServiceLoginiframe/i.test(url)) {
        event.preventDefault();
        log.info('Intercepted Google login navigation; using external browser', url);
        run();
      }
    };
    win.webContents.on('will-navigate', maybeIntercept);
    win.webContents.on('will-redirect', maybeIntercept);

    // Blank authenticated Electron SPA → flip to status + Chrome shell
    win.webContents.on('did-finish-load', () => {
      const url = win.webContents.getURL() || '';
      if (/messages\.google\.com\/web\/u\//i.test(url) || /messages\.google\.com\/web\/conversations/i.test(url)) {
        setTimeout(async () => {
          try {
            const textLen = await win.webContents.executeJavaScript(
              '(document.body && document.body.innerText || "").trim().length',
              true,
            );
            const hasRouterOnly = await win.webContents.executeJavaScript(
              '!!document.querySelector("mw-app router-outlet") && !document.querySelector("mw-app")?.innerText',
              true,
            );
            if ((textLen < 5 || hasRouterOnly) && readState(app)?.ready !== false) {
              log.warn('Detected blank Messages SPA in Electron; switching to Chrome app shell', { url, textLen });
              writeState(app, {
                ready: true,
                browserPath: findBrowser(),
                profileDir: profileDirFor(app),
                updatedAt: new Date().toISOString(),
                mode: 'chrome-app',
                recoveredFromBlank: true,
              });
              openChromeApp(app, log, MESSAGES_URL);
              await showStatusWindow(() => win, log);
            }
          } catch (err) {
            log.warn('blank-spa detection failed', String(err));
          }
        }, 4000);
      }
    });
  }

  return { startBrowserSignIn: run, attachWindow, openChromeApp: openShell };
}

module.exports = {
  install,
  startBrowserSignIn,
  findBrowser,
  LOGIN_URL,
  MESSAGES_URL,
  openChromeApp,
};
