'use strict';

/**
 * Default Programs registration for sms:/tel: (and smsto:/callto:).
 * Win11 browser pickers enumerate HKLM RegisteredApplications (like Chrome/Brave).
 * We write HKLM when allowed, always write HKCU, and never bind node.exe.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  APP_NAME,
  APP_REG_NAME,
  PROG_ID_SMS,
  PROG_ID_TEL,
  hostLaunchCommand,
  hostExePath,
  dataRoot,
  installDir,
} = require('./config');
const log = require('./log');

// Under Clients\ — same pattern browsers use for protocol claims
const CAPS_REL = `Software\\Clients\\${APP_REG_NAME}\\Capabilities`;
const PROG_ID_SMSTO = 'GoogleMessages.smsto';
const PROG_ID_CALLTO = 'GoogleMessages.callto';

function reg(hivePrefix, args) {
  // hivePrefix unused — full key paths include HKCU/HKLM
  const r = spawnSync('reg.exe', args, { encoding: 'utf8', windowsHide: true });
  return { status: r.status, out: ((r.stdout || '') + (r.stderr || '')).trim() };
}

function regAdd(key, valueName, valueData, valueType = 'REG_SZ') {
  const args = ['add', key, '/f', '/t', valueType];
  if (valueName === '' || valueName == null) args.push('/ve');
  else args.push('/v', valueName);
  args.push('/d', valueData == null ? '' : String(valueData));
  const r = reg(null, args);
  if (r.status !== 0) {
    throw new Error(`reg add failed ${key} ${valueName}: ${r.out || r.status}`);
  }
}

function tryRegAdd(key, valueName, valueData, valueType = 'REG_SZ') {
  try {
    regAdd(key, valueName, valueData, valueType);
    return true;
  } catch (_) {
    return false;
  }
}

function regAddNone(key, valueName) {
  const r = reg(null, ['add', key, '/f', '/t', 'REG_NONE', '/v', valueName]);
  if (r.status !== 0) {
    tryRegAdd(key, valueName, '');
  }
}

function regDeleteKey(key) {
  reg(null, ['delete', key, '/f']);
}

function regDeleteValue(key, valueName) {
  reg(null, ['delete', key, '/v', valueName, '/f']);
}

function notifyShell() {
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
      `Add-Type -Namespace Native -Name Shell32 -MemberDefinition '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);';
       [Native.Shell32]::SHChangeNotify(0x8000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)`,
    ],
    { windowsHide: true },
  );
}

function cleanupLegacyKeys() {
  const legacyKeys = [
    'HKCU\\Software\\Classes\\Google Messages.sms',
    'HKCU\\Software\\Classes\\Google Messages.tel',
    'HKCU\\Software\\Google Messages',
    'HKCU\\Software\\GoogleMessages', // old caps path (moved under Clients)
    'HKCU\\Software\\Classes\\Applications\\Google Messages.exe',
    'HKLM\\Software\\GoogleMessages',
  ];
  for (const k of legacyKeys) {
    regDeleteKey(k);
  }
  regDeleteValue('HKCU\\Software\\RegisteredApplications', 'Google Messages');
  regDeleteValue('HKCU\\Software\\RegisteredApplications', APP_REG_NAME);
  regDeleteValue('HKLM\\Software\\RegisteredApplications', 'Google Messages');
  // Remove Node.js as an sms handler candidate if we accidentally registered it
  regDeleteKey('HKCU\\Software\\Classes\\Applications\\node.exe');
  // Stale AppUserModelID on protocol classes confuses some pickers
  regDeleteValue('HKCU\\Software\\Classes\\tel', 'AppUserModelID');
  regDeleteValue('HKCU\\Software\\Classes\\sms', 'AppUserModelID');
}

function ensureStartMenuShortcut(exe) {
  const programs = path.join(
    process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
  );
  fs.mkdirSync(programs, { recursive: true });
  const lnk = path.join(programs, `${APP_NAME}.lnk`);
  const ps = `
$W = New-Object -ComObject WScript.Shell
$S = $W.CreateShortcut(${JSON.stringify(lnk)})
$S.TargetPath = ${JSON.stringify(exe)}
$S.WorkingDirectory = ${JSON.stringify(path.dirname(exe))}
$S.Description = ${JSON.stringify(APP_NAME)}
$S.IconLocation = ${JSON.stringify(exe + ',0')}
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
  log.info('Start Menu shortcut', lnk);
}

/**
 * Copy host into a stable install dir so Default Apps treats it like a real app
 * (dev builds under dist\\ are easy for Windows to ignore in Suggested lists).
 * Path has no spaces: %LOCALAPPDATA%\\Programs\\GoogleMessages\\
 */
function ensureStableInstall(exe) {
  const destDir = installDir();
  const destExe = path.join(destDir, path.basename(exe));
  try {
    fs.mkdirSync(destDir, { recursive: true });
    if (path.resolve(exe) !== path.resolve(destExe)) {
      fs.copyFileSync(exe, destExe);
    }
    return destExe;
  } catch (err) {
    log.warn('Stable install copy failed; using current exe', String(err));
    return exe;
  }
}

/**
 * Set Windows UserChoice (hashed) so tel:/sms: open us without the Suggested-apps
 * picker that only lists browsers. Uses vendored MIT PS-SFTA (DanysysTeam).
 */
function setProtocolUserChoice() {
  // Opt out: set GMFD_SKIP_SFTA=1 to register ProgIds/Capabilities without forcing UserChoice.
  if (/^(1|true|yes)$/i.test(String(process.env.GMFD_SKIP_SFTA || '').trim())) {
    log.info('Skipping UserChoice (GMFD_SKIP_SFTA)');
    return false;
  }
  const vendorSrc = path.join(__dirname, 'vendor', 'SFTA.ps1');
  let scriptBody;
  try {
    scriptBody = fs.readFileSync(vendorSrc, 'utf8');
  } catch (err) {
    log.warn('SFTA.ps1 missing; cannot set UserChoice defaults', String(err));
    return false;
  }
  const outScript = path.join(dataRoot(), 'SFTA.ps1');
  fs.writeFileSync(outScript, scriptBody, 'utf8');
  const pairs = [
    [PROG_ID_TEL, 'tel'],
    [PROG_ID_SMS, 'sms'],
    [PROG_ID_SMSTO, 'smsto'],
    [PROG_ID_CALLTO, 'callto'],
  ];
  const setCmds = pairs
    .map(([prog, proto]) => `Set-FTA -ProgId ${JSON.stringify(prog)} -Extension ${JSON.stringify(proto)}`)
    .join('; ');
  const ps = `. ${JSON.stringify(outScript)}; ${setCmds}; Write-Output 'SFTA_OK'`;
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
      '-Command',
      ps,
    ],
    { encoding: 'utf8', windowsHide: true, timeout: 60000 },
  );
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  if (r.status !== 0 || !/SFTA_OK/.test(out)) {
    log.warn('Set-FTA UserChoice failed', out || String(r.status));
    return false;
  }
  log.info('Set UserChoice defaults via SFTA', { tel: PROG_ID_TEL, sms: PROG_ID_SMS });
  return true;
}

function registerProgId(root, progId, label, cmd, icon) {
  const base = `${root}\\Software\\Classes\\${progId}`;
  regAdd(base, '', label);
  regAdd(base, 'URL Protocol', '');
  regAdd(base, 'FriendlyTypeName', label);
  regAdd(`${base}\\DefaultIcon`, '', icon);
  regAdd(`${base}\\shell\\open\\command`, '', cmd);
}

function registerSchemeClass(root, scheme, label, progId, cmd, icon) {
  const base = `${root}\\Software\\Classes\\${scheme}`;
  regAdd(base, '', label);
  regAdd(base, 'URL Protocol', '');
  regAdd(`${base}\\DefaultIcon`, '', icon);
  regAdd(`${base}\\shell\\open\\command`, '', cmd);
  regAddNone(`${base}\\OpenWithProgids`, progId);
}

function registerApplicationExe(root, exeName, cmd, icon) {
  const base = `${root}\\Software\\Classes\\Applications\\${exeName}`;
  regAdd(base, 'FriendlyAppName', APP_NAME);
  regAdd(`${base}\\DefaultIcon`, '', icon);
  regAdd(`${base}\\shell\\open\\command`, '', cmd);
}

function registerAppPaths(root, exe, exeName) {
  const base = `${root}\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exeName}`;
  regAdd(base, '', exe);
  regAdd(base, 'Path', path.dirname(exe));
}

function registerCapabilities(root, icon) {
  const caps = `${root}\\${CAPS_REL}`;
  regAdd(`${root}\\Software\\Clients\\${APP_REG_NAME}`, '', APP_NAME);
  regAdd(caps, 'ApplicationName', APP_NAME);
  regAdd(
    caps,
    'ApplicationDescription',
    'Send SMS/RCS with Google Messages for web (dedicated desktop app).',
  );
  regAdd(caps, 'ApplicationIcon', icon);
  regAdd(`${caps}\\URLAssociations`, 'sms', PROG_ID_SMS);
  regAdd(`${caps}\\URLAssociations`, 'smsto', PROG_ID_SMSTO);
  regAdd(`${caps}\\URLAssociations`, 'tel', PROG_ID_TEL);
  regAdd(`${caps}\\URLAssociations`, 'callto', PROG_ID_CALLTO);
  regAdd(`${root}\\Software\\RegisteredApplications`, APP_REG_NAME, CAPS_REL);
}

function registerToast(progId, scheme) {
  tryRegAdd(
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\ApplicationAssociationToasts',
    `${progId}_${scheme}`,
    '0',
    'REG_DWORD',
  );
}

function registerIntoHive(root, exe, cmd, icon, exeName) {
  registerProgId(root, PROG_ID_SMS, 'URL:SMS Message (Google Messages)', cmd, icon);
  registerProgId(root, PROG_ID_TEL, 'URL:Telephone text (Google Messages)', cmd, icon);
  registerProgId(root, PROG_ID_SMSTO, 'URL:SMS Message (Google Messages)', cmd, icon);
  registerProgId(root, PROG_ID_CALLTO, 'URL:Callto text (Google Messages)', cmd, icon);

  registerSchemeClass(root, 'sms', 'URL:SMS Message', PROG_ID_SMS, cmd, icon);
  registerSchemeClass(root, 'smsto', 'URL:SMS Message', PROG_ID_SMSTO, cmd, icon);
  registerSchemeClass(root, 'tel', 'URL:Telephone', PROG_ID_TEL, cmd, icon);
  registerSchemeClass(root, 'callto', 'URL:Callto', PROG_ID_CALLTO, cmd, icon);

  registerApplicationExe(root, exeName, cmd, icon);
  registerAppPaths(root, exe, exeName);
  registerCapabilities(root, icon);
}

function registrationIsCurrent(exe) {
  try {
    const p = path.join(dataRoot(), 'last-registration.json');
    if (!fs.existsSync(p)) return false;
    const prev = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!prev || prev.exe !== exe) return false;
    // Another instance is mid-register — avoid PowerShell storms / console flashes
    if (prev.inProgress) {
      const age = Date.now() - new Date(prev.at).getTime();
      if (Number.isFinite(age) && age >= 0 && age < 60000) return true;
    }
    return (
      prev.userChoice === true &&
      prev.progIdTel === PROG_ID_TEL &&
      prev.caps === CAPS_REL
    );
  } catch (_) {
    return false;
  }
}

function registerProtocols(opts = {}) {
  const force = Boolean(opts.force);
  let exe = hostExePath();
  exe = ensureStableInstall(exe);
  const cmd = `"${exe}" "%1"`;
  const icon = `${exe},0`;
  const exeName = path.basename(exe);

  if (/^node(\.exe)?$/i.test(exeName)) {
    throw new Error(
      'Refusing to register node.exe as the SMS handler. Build the host first (npm run windows:host).',
    );
  }

  if (!force && registrationIsCurrent(exe)) {
    log.info('Protocol registration current; skipping heavy re-register', { exe });
    return { skipped: true, exe };
  }

  log.info('Registering protocol handlers (Default Programs)', { cmd, exe, exeName });

  // Mark in-progress early so overlapping launches skip SFTA/PowerShell storms
  try {
    fs.writeFileSync(
      path.join(dataRoot(), 'last-registration.json'),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          exe,
          cmd,
          progIdSms: PROG_ID_SMS,
          progIdTel: PROG_ID_TEL,
          caps: CAPS_REL,
          hklm: false,
          userChoice: false,
          inProgress: true,
        },
        null,
        2,
      ),
    );
  } catch (_) {
    /* ignore */
  }

  cleanupLegacyKeys();

  // Always per-user
  registerIntoHive('HKCU', exe, cmd, icon, exeName);

  // Machine-wide — required for Chrome/Brave "Suggested apps" lists on Win11
  let hklmOk = false;
  try {
    registerIntoHive('HKLM', exe, cmd, icon, exeName);
    hklmOk = true;
    log.info('Also registered machine-wide (HKLM) for browser protocol pickers');
  } catch (err) {
    log.warn(
      'HKLM registration skipped (need admin once for browser pickers)',
      String(err && err.message ? err.message : err),
    );
  }

  registerToast(PROG_ID_SMS, 'sms');
  registerToast(PROG_ID_TEL, 'tel');
  registerToast(PROG_ID_SMSTO, 'smsto');
  registerToast(PROG_ID_CALLTO, 'callto');

  ensureStartMenuShortcut(exe);
  const userChoiceOk = setProtocolUserChoice();
  notifyShell();

  try {
    fs.writeFileSync(
      path.join(dataRoot(), 'last-registration.json'),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          exe,
          cmd,
          progIdSms: PROG_ID_SMS,
          progIdTel: PROG_ID_TEL,
          caps: CAPS_REL,
          hklm: hklmOk,
          userChoice: userChoiceOk,
        },
        null,
        2,
      ),
    );
  } catch (_) {
    /* ignore */
  }

  log.info('Protocol registration complete', {
    registeredAs: APP_REG_NAME,
    smsProgId: PROG_ID_SMS,
    telProgId: PROG_ID_TEL,
    hklm: hklmOk,
    userChoice: userChoiceOk,
    applications: exeName,
  });
  return { hklm: hklmOk, userChoice: userChoiceOk, exe };
}

module.exports = {
  registerProtocols,
  APP_REG_NAME,
  PROG_ID_SMS,
  PROG_ID_TEL,
  CAPS_REL,
};
