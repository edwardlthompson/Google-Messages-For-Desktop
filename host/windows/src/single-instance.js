'use strict';

const net = require('net');
const fs = require('fs');
const { PIPE_NAME, lockPath, readPipeToken, ensurePipeToken } = require('./config');
const log = require('./log');

/**
 * Windows named-pipe single-instance.
 * Primary listens; secondary connects, sends JSON command (+ token), exits.
 */
function tryBecomePrimary(onCommand) {
  return new Promise((resolve) => {
    ensurePipeToken();
    const server = net.createServer((socket) => {
      let buf = '';
      socket.on('data', (chunk) => {
        buf += chunk.toString('utf8');
        if (buf.includes('\n')) {
          const line = buf.split('\n')[0];
          try {
            const msg = JSON.parse(line);
            Promise.resolve(onCommand(msg))
              .then((r) => {
                socket.end(JSON.stringify(r || { ok: true }) + '\n');
              })
              .catch((err) => {
                socket.end(JSON.stringify({ ok: false, error: String(err) }) + '\n');
              });
          } catch (err) {
            socket.end(JSON.stringify({ ok: false, error: String(err) }) + '\n');
          }
        }
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EEXIST') {
        resolve({ primary: false });
      } else {
        log.warn('Pipe server error', String(err));
        resolve({ primary: false, error: err });
      }
    });

    server.listen(PIPE_NAME, () => {
      try {
        fs.writeFileSync(lockPath(), String(process.pid), 'utf8');
      } catch (_) {}
      log.info('Primary instance listening', PIPE_NAME);
      resolve({ primary: true, server });
    });
  });
}

function sendToPrimary(msg, timeoutMs = 5000) {
  const token = readPipeToken() || ensurePipeToken();
  const payload = { ...msg, token };
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(PIPE_NAME, () => {
      socket.write(JSON.stringify(payload) + '\n');
    });
    let buf = '';
    const t = setTimeout(() => {
      socket.destroy();
      reject(new Error('primary timeout'));
    }, timeoutMs);
    socket.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      if (buf.includes('\n')) {
        clearTimeout(t);
        try {
          resolve(JSON.parse(buf.split('\n')[0]));
        } catch (e) {
          reject(e);
        }
        socket.end();
      }
    });
    socket.on('error', (err) => {
      clearTimeout(t);
      reject(err);
    });
  });
}

module.exports = { tryBecomePrimary, sendToPrimary };
