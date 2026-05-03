// popup.js — Usage stats + Chrome AI check + Custom Sites management

const FREE_LIMIT = 3;
const RING_CIRCUMFERENCE = 220;

const DEFAULT_SITES = [
  { host: 'chat.openai.com', label: 'ChatGPT', icon: '🤖' },
  { host: 'chatgpt.com', label: 'ChatGPT', icon: '🤖' },
  { host: 'claude.ai', label: 'Claude', icon: '🟠' },
  { host: 'gemini.google.com', label: 'Gemini', icon: '✨' },
  { host: 'mail.google.com', label: 'Gmail', icon: '📧' },
  { host: 'outlook.live.com', label: 'Outlook', icon: '📬' },
  { host: 'outlook.office.com', label: 'Outlook 365', icon: '📬' },
];

document.addEventListener('DOMContentLoaded', () => {
  // ── LOAD USAGE ──
  chrome.storage.sync.get(['humanize_usage'], (result) => {
    const count = result.humanize_usage || 0;
    renderUsage(count);
  });

  // ── CHECK CHROME AI ──
  checkChromeAI();

  // ── LOAD & RENDER SITES ──
  loadAndRenderSites();

  // ── ADD SITE BUTTON ──
  document.getElementById('site-add-btn').addEventListener('click', addCustomSite);
  document.getElementById('site-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomSite();
  });
});

function renderUsage(count) {
  document.getElementById('usage-count').textContent = count;

  const remaining = Math.max(0, FREE_LIMIT - count);
  const remainingEl = document.getElementById('remaining-count');
  const captionEl = document.getElementById('usage-caption');

  if (count >= FREE_LIMIT) {
    remainingEl.textContent = '0';
    captionEl.innerHTML = '<strong style="color:#ef4444">Limit reached</strong> — upgrade to continue';
    document.getElementById('upgrade-card').classList.add('visible');
  } else {
    remainingEl.textContent = remaining;
    captionEl.innerHTML = `<strong id="remaining-count">${remaining}</strong> free use${remaining !== 1 ? 's' : ''} remaining`;
  }

  const fill = document.getElementById('ring-fill');
  const fraction = Math.min(count / FREE_LIMIT, 1);
  const offset = RING_CIRCUMFERENCE * (1 - fraction);
  requestAnimationFrame(() => {
    setTimeout(() => {
      fill.style.strokeDashoffset = offset;
    }, 80);
  });

  if (count >= FREE_LIMIT) {
    fill.style.stroke = '#ef4444';
  }
}

function getAIFactory() {
  if (window.ai && window.ai.languageModel) return window.ai.languageModel;
  if (window.ai && window.ai.assistant) return window.ai.assistant;
  if (window.LanguageModel) return window.LanguageModel;
  return null;
}

async function checkChromeAI() {
  const box = document.getElementById('ai-status-box');
  const text = document.getElementById('ai-status-text');

  try {
    const factory = getAIFactory();
    if (!factory) {
      setAIOff(box, text);
      return;
    }
    const cap = await factory.capabilities?.();
    if (cap && cap.available !== 'no') {
      box.className = 'ai-status ai-status--on';
      box.querySelector('.ai-status-icon').textContent = '✅';
      text.textContent = 'Chrome Gemini Nano is active. Rewrite mode is unlocked.';
    } else {
      setAIOff(box, text);
    }
  } catch {
    setAIOff(box, text);
  }
}

function setAIOff(box, text) {
  box.className = 'ai-status ai-status--off';
  box.style.display = 'block';
  box.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span class="ai-status-icon">⚠️</span>
      <span style="font-weight:600">Rewrite mode is currently blocked</span>
    </div>
    <div style="font-size:11px;color:#fcd34d;line-height:1.4">
      Extensions cannot change Chrome's core security settings for you. To unlock Rewrite, you must manually enable Chrome AI:<br><br>
      1. Navigate to <strong>chrome://flags</strong><br>
      2. Search for <strong>Prompt API for Gemini Nano</strong> and set to <strong>Enabled</strong><br>
      3. Search for <strong>Optimization Guide On Device Model</strong> and set to <strong>Enabled BypassPrefRequirement</strong><br>
      4. Restart Chrome.<br><br>
      <button id="flags-btn" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;font-size:11px;cursor:pointer;padding:4px 8px;font-family:inherit;">
        Open chrome://flags now →
      </button>
    </div>
  `;
  document.getElementById('flags-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'open-chrome-flags' });
  });
}

// ══════════════════════════════════
// CUSTOM SITES MANAGEMENT
// ══════════════════════════════════

function loadAndRenderSites() {
  chrome.storage.sync.get(['humanize_custom_sites'], (result) => {
    const customSites = result.humanize_custom_sites || [];
    renderSites(customSites);
  });
}

function renderSites(customSites) {
  const list = document.getElementById('sites-list');
  list.innerHTML = '';

  // Render defaults (locked, non-removable)
  DEFAULT_SITES.forEach(site => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span class="site-item-name">
        <span class="site-icon">${site.icon}</span>
        ${site.label}
      </span>
      <span class="site-badge-default">DEFAULT</span>
    `;
    list.appendChild(item);
  });

  // Render custom sites (removable)
  customSites.forEach(host => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span class="site-item-name">
        <span class="site-icon">🌐</span>
        ${host}
      </span>
      <button class="site-remove-btn" data-host="${host}" title="Remove">✕</button>
    `;
    item.querySelector('.site-remove-btn').addEventListener('click', () => removeCustomSite(host));
    list.appendChild(item);
  });
}

function addCustomSite() {
  const input = document.getElementById('site-input');
  const errorEl = document.getElementById('site-error');
  let host = input.value.trim().toLowerCase();

  // Clean up: remove protocol, path, www
  host = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

  // Validate
  if (!host || !host.includes('.')) {
    errorEl.textContent = 'Enter a valid domain (e.g. notion.so)';
    errorEl.style.display = 'block';
    return;
  }

  // Check if already in defaults
  if (DEFAULT_SITES.some(s => s.host === host)) {
    errorEl.textContent = 'This site is already in the default list.';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  input.value = '';

  chrome.storage.sync.get(['humanize_custom_sites'], (result) => {
    const custom = result.humanize_custom_sites || [];
    if (custom.includes(host)) {
      errorEl.textContent = 'This site is already added.';
      errorEl.style.display = 'block';
      return;
    }
    custom.push(host);
    chrome.storage.sync.set({ humanize_custom_sites: custom }, () => {
      renderSites(custom);
    });
  });
}

function removeCustomSite(host) {
  chrome.storage.sync.get(['humanize_custom_sites'], (result) => {
    const custom = (result.humanize_custom_sites || []).filter(h => h !== host);
    chrome.storage.sync.set({ humanize_custom_sites: custom }, () => {
      renderSites(custom);
    });
  });
}

