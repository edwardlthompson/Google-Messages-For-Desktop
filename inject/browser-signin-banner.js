/**
 * Offers external Chrome/Edge sign-in because Google rejects Electron login.
 */
'use strict';

const { ipcRenderer } = require('electron');

const BANNER_ID = 'gmfd-browser-signin-banner';

function looksSignedIn() {
  const href = location.href || '';
  if (/\/conversations/i.test(href)) return true;
  if (/\/web\/u\/\d+/i.test(href) && !/welcome|postSignIn/i.test(href)) return true;
  const t = ((document.body && document.body.innerText) || '').toLowerCase();
  // Rough: conversation list / compose UI without the marketing welcome copy
  if (t.includes('welcome to google messages')) return false;
  if (t.includes('start chat') || t.includes('message status')) return true;
  return false;
}

function pageNeedsExternalSignIn() {
  const href = location.href || '';
  if (/accounts\.google\.com/i.test(href)) return true;
  if (!/messages\.google\.com\/web/i.test(href)) return false;
  if (looksSignedIn()) return false;
  return true;
}

function removeBanner() {
  const el = document.getElementById(BANNER_ID);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function showBanner() {
  if (document.getElementById(BANNER_ID)) return;
  const wrap = document.createElement('div');
  wrap.id = BANNER_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    left: '16px',
    right: '16px',
    bottom: '16px',
    zIndex: '2147483647',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: '14px 16px',
    borderRadius: '10px',
    background: '#0b57d0',
    color: '#fff',
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontSize: '14px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
  });
  const text = document.createElement('div');
  text.style.flex = '1 1 220px';
  text.textContent =
    'Google blocks sign-in inside this app. Sign in with Chrome/Edge — Messages then opens in a Chrome app window.';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Sign in with browser';
  Object.assign(btn.style, {
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: '#fff',
    color: '#0b57d0',
  });
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Opening browser…';
    try {
      await ipcRenderer.invoke('gmfd-browser-signin');
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Sign in with browser';
      text.textContent = `Could not start browser sign-in: ${err && err.message ? err.message : err}`;
    }
  });
  wrap.appendChild(text);
  wrap.appendChild(btn);
  (document.body || document.documentElement).appendChild(wrap);
}

function tick() {
  try {
    if (pageNeedsExternalSignIn()) showBanner();
    else removeBanner();
  } catch (_) {
    /* ignore */
  }
}

tick();
setInterval(tick, 1500);
window.addEventListener('load', tick);
document.addEventListener('DOMContentLoaded', tick);
