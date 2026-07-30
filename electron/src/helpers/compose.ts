/**
 * Build a page-context expression that starts a new Google Messages chat.
 * Ported from host/windows/src/compose.js / inject/compose-from-protocol.js.
 */
export function buildComposeExpression(number: string): string {
  const n = JSON.stringify(number);
  return `(() => {
    const number = ${n};
    const RETRY_MS = 1500;
    const MAX_ATTEMPTS = 20;

    function showBanner(message, isError) {
      const id = 'gmfd-protocol-banner';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.setAttribute('role', 'status');
        Object.assign(el.style, {
          position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
          zIndex: '2147483647', maxWidth: '90%', padding: '10px 16px', borderRadius: '8px',
          fontFamily: 'system-ui, Segoe UI, sans-serif', fontSize: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', color: '#fff',
        });
        (document.body || document.documentElement).appendChild(el);
      }
      el.style.background = isError ? '#b3261e' : '#1a73e8';
      el.textContent = message;
      clearTimeout(el._gmfdTimer);
      el._gmfdTimer = setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 8000);
    }

    function clickIfVisible(el) {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (el.offsetParent === null && style.position !== 'fixed') return false;
      el.click();
      return true;
    }

    function findStartChatControl() {
      const selectors = [
        'a[href*="/web/conversations/new"]', 'a[href*="conversations/new"]',
        'button[aria-label*="Start chat"]', 'button[aria-label*="Start Chat"]',
        '[aria-label*="Start chat"]', '[data-e2e-start-chat]',
        'button[mattooltip*="Start chat"]',
      ];
      for (const sel of selectors) {
        try { const el = document.querySelector(sel); if (el) return el; } catch (_) {}
      }
      const candidates = document.querySelectorAll('button, a, [role="button"]');
      for (const el of candidates) {
        const t = ((el.getAttribute('aria-label') || '') + ' ' + (el.textContent || '')).toLowerCase();
        if (t.includes('start chat') || t.includes('new conversation')) return el;
      }
      return null;
    }

    function findRecipientInput() {
      const selectors = [
        'input[aria-label*="number"]', 'input[aria-label*="Number"]',
        'input[aria-label*="phone"]', 'input[aria-label*="Phone"]',
        'input[aria-label*="contact"]', 'input[placeholder*="number"]',
        'input[placeholder*="phone"]', 'input[type="tel"]',
        'input[data-e2e-recipient-input]', 'mw-new-conversation-container input', 'input.input',
      ];
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el && el.offsetParent !== null) return el;
        } catch (_) {}
      }
      return null;
    }

    function setInputValue(input, value) {
      input.focus();
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (proto && proto.set) proto.set.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      try { input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value })); } catch (_) {}
    }

    function tryCompose() {
      const start = findStartChatControl();
      if (start) clickIfVisible(start);
      const input = findRecipientInput();
      if (!input) return false;
      setInputValue(input, number);
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true,
      }));
      return true;
    }

    showBanner('Starting a new text to ' + number + '…', false);
    return new Promise((resolve) => {
      let attempts = 0;
      const tick = () => {
        attempts += 1;
        if (tryCompose()) {
          showBanner('New text to ' + number + ' — finish in Google Messages', false);
          resolve({ ok: true, attempts });
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          showBanner('Could not auto-fill chat for ' + number + '. Open Start chat and paste the number.', true);
          try { sessionStorage.setItem('gmfd-compose-number', number); } catch (_) {}
          resolve({ ok: false, attempts });
          return;
        }
        setTimeout(tick, RETRY_MS);
      };
      setTimeout(tick, 800);
    });
  })()`;
}
