'use strict';

const http = require('http');
const crypto = require('crypto');
const { getCdpPort, sanitizeMessagesUrl } = require('./config');
const log = require('./log');

function defaultPort() {
  return getCdpPort();
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
      }, 20000);
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

async function waitForCdp(port = defaultPort(), attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      await getJson(`http://127.0.0.1:${port}/json/version`);
      return true;
    } catch (_) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

async function listPages(port = defaultPort()) {
  const tabs = await getJson(`http://127.0.0.1:${port}/json`);
  return (tabs || []).filter((t) => t.type === 'page');
}

async function withMessagesPage(fn, port = defaultPort()) {
  const pages = await listPages(port);
  const page =
    pages.find((t) => /messages\.google\.com/i.test(t.url || '')) ||
    pages[0];
  if (!page || !page.webSocketDebuggerUrl) {
    throw new Error('No Messages page target in Chromium');
  }
  const ws = await wsConnect(page.webSocketDebuggerUrl);
  try {
    return await fn(ws, page);
  } finally {
    ws.close();
  }
}

async function evaluate(expression, port = defaultPort()) {
  return withMessagesPage(async (ws) => {
    await ws.send('Runtime.enable');
    const r = await ws.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      log.warn('CDP evaluate exception', r.exceptionDetails);
    }
    return r.result && r.result.value;
  }, port);
}

async function navigate(url, port = defaultPort()) {
  const safe = sanitizeMessagesUrl(url);
  if (!safe) {
    throw new Error('CDP navigate blocked: URL must be https://messages.google.com/…');
  }
  return withMessagesPage(async (ws) => {
    await ws.send('Page.enable');
    await ws.send('Page.navigate', { url: safe });
  }, port);
}

/** Bring the Messages app window to the foreground without opening a browser tab. */
async function focusMessagesWindow(port = defaultPort()) {
  const pages = await listPages(port);
  const page =
    pages.find((t) => /messages\.google\.com/i.test(t.url || '')) || pages[0];
  if (!page || !page.webSocketDebuggerUrl) return false;
  const ws = await wsConnect(page.webSocketDebuggerUrl);
  try {
    await ws.send('Page.bringToFront');
    try {
      await ws.send('Browser.getWindowForTarget', { targetId: page.id });
    } catch (_) {
      /* older CDP */
    }
    return true;
  } finally {
    ws.close();
  }
}

module.exports = {
  getJson,
  waitForCdp,
  listPages,
  withMessagesPage,
  evaluate,
  navigate,
  focusMessagesWindow,
};
