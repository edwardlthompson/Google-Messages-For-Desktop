#!/usr/bin/env node
/**
 * Post-Nativefier patch: sms:/tel: handlers + Google external browser sign-in.
 *
 * Usage: node scripts/windows/patch-protocol-handlers.js <appRoot>
 */
'use strict';

const fs = require('fs');
const path = require('path');

function findMainJs(root) {
  const candidates = [];
  function walk(dir, depth) {
    if (depth > 6) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === '.git') continue;
        walk(full, depth + 1);
      } else if (ent.name === 'main.js' && dir.replace(/\\/g, '/').endsWith('resources/app/lib')) {
        candidates.push(full);
      }
    }
  }
  walk(root, 0);
  return candidates[0] || null;
}

function copyBrowserAuthModule(libDir) {
  const src = path.resolve(__dirname, 'gmfd-browser-auth.js');
  const dest = path.join(libDir, 'gmfd-browser-auth.js');
  fs.copyFileSync(src, dest);
  console.log('Copied browser auth module:', dest);
  return dest;
}

function patchProtocolAndUa(src) {
  if (src.includes('__GMFD_PROTOCOL_PATCH__')) {
    return { src, changed: false };
  }

  const marker = '/* __GMFD_PROTOCOL_PATCH__ */';
  const appUserNeedle = 'electron_1.app.setAppUserModelId(electron_1.app.getName());';
  if (!src.includes(appUserNeedle)) {
    throw new Error('Could not find setAppUserModelId hook in main.js');
  }
  src = src.replace(
    appUserNeedle,
    `${appUserNeedle}
${marker}
try {
    if (process.platform === 'win32') {
        electron_1.app.setAsDefaultProtocolClient('sms');
        electron_1.app.setAsDefaultProtocolClient('tel');
        log.info('Registered sms/tel protocol clients');
    }
} catch (err) {
    log.error('Failed to register protocol clients', err);
}
/* __GMFD_GOOGLE_LOGIN_PATCH__ */
electron_1.app.whenReady().then(() => {
    try {
        const ua = electron_1.app.userAgentFallback || '';
        const majorMatch = ua.match(/Chrome\\/(\\d+)/i);
        const major = (majorMatch && majorMatch[1]) || '150';
        const ses = electron_1.session.defaultSession;
        if (ua) {
            ses.setUserAgent(ua);
        }
        const chUa = '"Google Chrome";v="' + major + '", "Chromium";v="' + major + '", "Not.A/Brand";v="99"';
        ses.webRequest.onBeforeSendHeaders((details, callback) => {
            const headers = details.requestHeaders;
            if (ua) {
                headers['User-Agent'] = ua;
            }
            headers['sec-ch-ua'] = chUa;
            headers['sec-ch-ua-mobile'] = '?0';
            headers['sec-ch-ua-platform'] = '"Windows"';
            callback({ cancel: false, requestHeaders: headers });
        });
        log.info('Applied Google login UA / Client Hints patch', { major });
    }
    catch (err) {
        log.error('Google login patch failed', err);
    }
});
`,
  );

  const urlArgvNeedle = "const urlArgv = process.argv.filter((a) => a.startsWith('http'));";
  if (!src.includes(urlArgvNeedle)) {
    throw new Error('Could not find urlArgv hook in main.js');
  }
  src = src.replace(
    urlArgvNeedle,
    `global.__gmfdPendingProtocolUrl = (process.argv.find((a) => /^(sms|tel):/i.test(a)) || null);
if (global.__gmfdPendingProtocolUrl) {
    log.info('Pending protocol URL from argv:', global.__gmfdPendingProtocolUrl);
}
${urlArgvNeedle}`,
  );

  const secondNeedle = `electron_1.app.on('second-instance', () => {
        log.debug('app.second-instance');
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                // try
                mainWindow.show();
            }
            if (mainWindow.isMinimized()) {
                // minimized
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });`;

  const secondReplacement = `electron_1.app.on('second-instance', (_event, commandLine) => {
        log.debug('app.second-instance', { commandLine });
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
            const proto = (commandLine || []).find((a) => /^(sms|tel):/i.test(a));
            if (proto) {
                mainWindow.webContents.send('open-url', proto);
            }
        } else {
            const proto = (commandLine || []).find((a) => /^(sms|tel):/i.test(a));
            if (proto) {
                global.__gmfdPendingProtocolUrl = proto;
            }
        }
    });`;

  if (!src.includes("electron_1.app.on('second-instance', () => {")) {
    throw new Error('Could not find second-instance hook in main.js');
  }
  src = src.replace(secondNeedle, secondReplacement);

  const readyNeedle = `(0, trayIcon_1.createTrayIcon)(appArgs, mainWindow);`;
  if (!src.includes(readyNeedle)) {
    throw new Error('Could not find createTrayIcon hook in main.js');
  }
  src = src.replace(
    readyNeedle,
    `${readyNeedle}
    if (global.__gmfdPendingProtocolUrl) {
        const pending = global.__gmfdPendingProtocolUrl;
        global.__gmfdPendingProtocolUrl = null;
        const sendPending = () => {
            try {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('open-url', pending);
                }
            } catch (err) {
                log.error('Failed to send pending protocol URL', err);
            }
        };
        mainWindow.webContents.on('did-finish-load', () => {
            setTimeout(sendPending, 1200);
        });
        setTimeout(sendPending, 3500);
        setTimeout(sendPending, 7000);
    }
`,
  );

  return { src, changed: true };
}

function patchBrowserAuth(src) {
  if (src.includes('__GMFD_BROWSER_AUTH_PATCH__')) {
    return { src, changed: false };
  }

  const readyNeedle = `(0, trayIcon_1.createTrayIcon)(appArgs, mainWindow);`;
  if (!src.includes(readyNeedle)) {
    throw new Error('Could not find createTrayIcon hook for browser auth');
  }

  const installBlock = `
    /* __GMFD_BROWSER_AUTH_PATCH__ */
    try {
        const gmfdBrowserAuth = require('./gmfd-browser-auth');
        global.__gmfdBrowserAuth = gmfdBrowserAuth.install({
            electron: electron_1,
            getMainWindow: () => mainWindow,
            log: log,
        });
        if (global.__gmfdBrowserAuth && mainWindow) {
            global.__gmfdBrowserAuth.attachWindow(mainWindow);
        }
        log.info('Installed external browser Google sign-in');
    } catch (err) {
        log.error('Failed to install browser sign-in', err);
    }
`;

  // Insert immediately after createTrayIcon line (and after protocol pending block if present)
  if (src.includes('__GMFD_BROWSER_AUTH_PATCH__')) {
    return { src, changed: false };
  }

  // Prefer placing after protocol pending block end, else right after tray create
  const protocolAnchor = `setTimeout(sendPending, 7000);
    }
`;
  if (src.includes(protocolAnchor)) {
    src = src.replace(protocolAnchor, `${protocolAnchor}${installBlock}`);
  } else {
    src = src.replace(readyNeedle, `${readyNeedle}\n${installBlock}`);
  }

  return { src, changed: true };
}

function restorePreloadIfBroken(libDir) {
  const preloadPath = path.join(libDir, 'preload.js');
  const bak = `${preloadPath}.pre-gmfd.bak`;
  if (!fs.existsSync(bak)) return false;
  const cur = fs.readFileSync(preloadPath, 'utf8');
  if (cur.includes('__GMFD_PRELOAD_INJECT_PATCH__')) {
    fs.copyFileSync(bak, preloadPath);
    console.log('Restored preload.js (removed broken eager-inject patch)');
    return true;
  }
  return false;
}

function patchSandbox(src) {
  if (src.includes('__GMFD_SANDBOX_PATCH__')) {
    return { src, changed: false };
  }
  const needle = `            contextIsolation: false,
            ...webPreferences,
        },`;
  if (!src.includes(needle)) {
    throw new Error('Could not find getDefaultWindowOptions webPreferences hook');
  }
  src = src.replace(
    needle,
    `            contextIsolation: false,
            /* __GMFD_SANDBOX_PATCH__ */
            // Electron 20+ defaults sandbox:true which breaks Nativefier preload inject (no fs).
            sandbox: false,
            ...webPreferences,
        },`,
  );
  return { src, changed: true };
}

function patch(mainPath) {
  const libDir = path.dirname(mainPath);
  copyBrowserAuthModule(libDir);
  restorePreloadIfBroken(libDir);

  // Ensure banner inject is present even without a full Nativefier rebuild
  const injectDir = path.join(libDir, '..', 'inject');
  if (fs.existsSync(injectDir)) {
    const bannerSrc = path.resolve(__dirname, '..', '..', 'inject', 'browser-signin-banner.js');
    if (fs.existsSync(bannerSrc)) {
      fs.copyFileSync(bannerSrc, path.join(injectDir, 'browser-signin-banner.js'));
      console.log('Synced browser-signin-banner.js into app inject/');
    }
  }

  let src = fs.readFileSync(mainPath, 'utf8');
  const original = src;

  const proto = patchProtocolAndUa(src);
  src = proto.src;
  const browser = patchBrowserAuth(src);
  src = browser.src;
  const sandbox = patchSandbox(src);
  src = sandbox.src;

  if (src === original) {
    console.log('main.js patches already applied:', mainPath);
    return false;
  }

  const bak = `${mainPath}.pre-gmfd.bak`;
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(mainPath, bak);
  }
  fs.writeFileSync(mainPath, src, 'utf8');
  console.log('Patched main.js:', {
    protocol: proto.changed,
    browserAuth: browser.changed,
    sandbox: sandbox.changed,
    path: mainPath,
  });
  return true;
}

function main() {
  const root = path.resolve(process.argv[2] || 'dist/Windows_Tray');
  if (!fs.existsSync(root)) {
    console.error('App root not found:', root);
    process.exit(1);
  }
  const mainJs = findMainJs(root);
  if (!mainJs) {
    console.error('Could not find resources/app/lib/main.js under', root);
    process.exit(1);
  }
  patch(mainJs, root);
}

main();
