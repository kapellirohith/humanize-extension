// content.js — Universal pill UI + selection detection (fixed positioning)

(() => {
  let pill = null, warnEl = null, previewCard = null;
  let currentSelection = null, currentRange = null;
  let pendingMode = null;
  let dismissedUntilReload = false; // X button sets this to true

  // ── SITE WHITELIST ──
  // Default sites where pill appears
  const DEFAULT_SITES = [
    'chat.openai.com',    // ChatGPT
    'chatgpt.com',        // ChatGPT new domain
    'claude.ai',          // Claude
    'gemini.google.com',  // Gemini
    'mail.google.com',    // Gmail
    'outlook.live.com',   // Outlook web
    'outlook.office.com', // Outlook 365
  ];

  let allowedSites = [...DEFAULT_SITES];
  let siteCheckDone = false;
  let currentSiteAllowed = false;

  // Load custom sites from storage and check if current site is allowed
  function initSiteCheck() {
    const hostname = window.location.hostname;
    chrome.storage.sync.get(['humanize_custom_sites'], (result) => {
      const custom = result.humanize_custom_sites || [];
      allowedSites = [...DEFAULT_SITES, ...custom];
      currentSiteAllowed = allowedSites.some(site => hostname.includes(site));
      siteCheckDone = true;
    });
  }
  initSiteCheck();

  // Listen for storage changes (user added/removed custom site from popup)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.humanize_custom_sites) {
      const custom = changes.humanize_custom_sites.newValue || [];
      allowedSites = [...DEFAULT_SITES, ...custom];
      const hostname = window.location.hostname;
      currentSiteAllowed = allowedSites.some(site => hostname.includes(site));
    }
  });

  // ── FORMAL DOCUMENT DETECTION ──
  // Only very specific multi-word technical/legal phrases trigger this
  const FORMAL_KEYWORDS = [
    'i am writing to request',
    'please find attached herewith',
    'for your kind consideration',
    'to whom it may concern',
    'sincerely yours',
    'loss at iter',
    'training status:',
    'architecture:',
    'corpus:',
    'grant proposal',
    'fellowship application',
    'recommendation letter',
    'reference letter',
    'nda agreement',
    'statement of work',
  ];

  // Returns true only if 2+ very specific formal phrases found
  // CEO mode uses same threshold — no stricter blocking
  function isFormalDocument(text) {
    const lower = text.toLowerCase();
    let hits = 0;
    for (const kw of FORMAL_KEYWORDS) { if (lower.includes(kw)) hits++; }
    return hits >= 2;
  }

  // ── USAGE ──
  function getUsage(cb) { chrome.storage.sync.get(['humanize_usage'], r => cb(r.humanize_usage || 0)); }
  function incUsage() { getUsage(n => chrome.storage.sync.set({ humanize_usage: n + 1 })); }

  // ── PILL ──
  function createPill(rect, rewriteAvailable) {
    destroyAll();
    pill = document.createElement('div');
    pill.id = 'humanize-pill';

    const modes = [
      { id:'subtle', label:'Subtle', title:'Professional with subtle human edits' },
      { id:'human',  label:'Human',  title:'Warm, casual, clearly typed by a person' },
      { id:'ceo',    label:'CEO',    title:'Ultra-short, exec reply', pro:true },
      { id:'rewrite',label:'✦ Rewrite', rewrite:true, disabled:!rewriteAvailable,
        title: rewriteAvailable ? 'AI rewrite via Chrome Gemini Nano' : 'Needs Chrome 127+ with AI flags enabled' }
    ];

    modes.forEach(({ id, label, title, pro, rewrite, disabled }) => {
      if (rewrite) {
        const sep = document.createElement('span');
        sep.className = 'humanize-sep';
        pill.appendChild(sep);
      }
      const btn = document.createElement('button');
      btn.className = 'humanize-btn' + (disabled ? ' humanize-btn--disabled' : '') + (rewrite ? ' humanize-btn--rewrite' : '');
      btn.dataset.mode = id;
      btn.title = title;
      btn.disabled = !!disabled;
      const span = document.createElement('span');
      span.textContent = label;
      btn.appendChild(span);
      if (pro) {
        const badge = document.createElement('span');
        badge.className = 'humanize-pro-badge';
        badge.textContent = 'PRO';
        btn.appendChild(badge);
      }
      if (!disabled) btn.addEventListener('click', e => { e.stopPropagation(); handleMode(id); });
      pill.appendChild(btn);
    });

    // X dismiss button — permanently hides pill until page reload
    const closeBtn = document.createElement('button');
    closeBtn.className = 'humanize-btn humanize-btn--close';
    closeBtn.title = 'Dismiss (until page reload)';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      dismissedUntilReload = true;
      destroyAll();
      lastText = '';
    });
    pill.appendChild(closeBtn);

    document.body.appendChild(pill);
    positionFixed(pill, rect);
    requestAnimationFrame(() => pill && pill.classList.add('humanize-pill--visible'));
  }

  function positionFixed(el, selRect) {
    if (!document.body.contains(el)) document.body.appendChild(el);
    el.style.visibility = 'hidden';
    el.style.left = '0px';
    el.style.top = '0px';

    const elW = el.offsetWidth || 320;
    const elH = el.offsetHeight || 50;
    const margin = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Use selRect values, but fall back to stored mouse position if rect is at 0,0
    let refTop = selRect.top;
    let refBottom = selRect.bottom || selRect.top + 20;
    let refLeft = selRect.left;
    let refWidth = selRect.width || 200;

    // Gmail/complex DOMs sometimes return 0,0 — fall back to last known mouse pos
    if (refTop === 0 && refLeft === 0 && lastMousePos.x > 0) {
      refLeft = lastMousePos.x - 100;
      refTop = lastMousePos.y - 60;
      refBottom = lastMousePos.y;
      refWidth = 200;
    }

    let top = refTop - elH - margin;
    if (top < margin) top = refBottom + margin;
    if (top + elH > vh - margin) top = margin;

    let left = refLeft + refWidth / 2 - elW / 2;
    left = Math.max(margin, Math.min(left, vw - elW - margin));

    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.visibility = '';
  }

  function destroyAll() {
    [pill, warnEl, previewCard].forEach(el => el && el.remove());
    pill = warnEl = previewCard = null;
    // NOTE: do NOT reset pendingMode here — showFormalWarning reads it after calling destroyAll
  }

  // ── FORMAL DOC WARNING ──
  function showFormalWarning(rect, mode) {
    // BUG FIX: set pendingMode BEFORE destroyAll (destroyAll no longer wipes it)
    pendingMode = mode;
    destroyAll();

    warnEl = document.createElement('div');
    warnEl.id = 'humanize-warn';

    const isCEO = mode === 'ceo';
    warnEl.innerHTML = isCEO
      ? `<div class="humanize-warn__title">⚠ CEO mode blocked</div>
         <div class="humanize-warn__body">CEO mode is disabled for formal documents. Using it on a grant or TPU request would be catastrophic.</div>
         <div class="humanize-warn__actions">
           <button class="humanize-warn__cancel">Got it</button>
         </div>`
      : `<div class="humanize-warn__title">⚠ Formal document detected</div>
         <div class="humanize-warn__body">This looks like a formal document. Humanizing may hurt your credibility.</div>
         <div class="humanize-warn__actions">
           <button class="humanize-warn__go">Humanize anyway</button>
           <button class="humanize-warn__cancel">Cancel</button>
         </div>`;

    document.body.appendChild(warnEl);
    positionFixed(warnEl, rect);
    requestAnimationFrame(() => warnEl && warnEl.classList.add('humanize-warn--visible'));

    warnEl.querySelector('.humanize-warn__cancel')?.addEventListener('click', () => {
      pendingMode = null;
      destroyAll();
    });
    warnEl.querySelector('.humanize-warn__go')?.addEventListener('click', () => {
      // BUG FIX: capture mode locally BEFORE destroyAll clears anything
      const capturedMode = pendingMode;
      const capturedSelection = currentSelection;
      const capturedRange = currentRange;
      pendingMode = null;
      destroyAll();
      // Restore selection state then execute
      currentSelection = capturedSelection;
      currentRange = capturedRange;
      executeMode(capturedMode);
    });
  }

  // ── BUG 11 — TRANSACTIONAL / SECURITY EMAIL DETECTION ──
  const TRANSACTIONAL_KEYWORDS = [
    'verify','verification','confirm your email','password','logged in',
    'login attempt','security alert','suspicious','click the link',
    'account access','reset','otp','invoice','receipt',
    'order confirmation','shipment','delivery','tracking',
    'unsubscribe','billing'
  ];

  function isTransactionalEmail(text) {
    const lower = text.toLowerCase();
    return TRANSACTIONAL_KEYWORDS.some(kw => lower.includes(kw));
  }

  // ── MODE HANDLING ──
  function handleMode(mode) {
    if (!currentSelection) return;
    const text = currentSelection;
    if (text.length < 40 || text.length > 5000) { destroyAll(); return; }

    getUsage(count => {
      if (count >= 3) { showUpgradeBanner(); destroyAll(); return; }

      // Bug 11: block CEO on transactional/security emails
      if (mode === 'ceo' && isTransactionalEmail(text)) {
        const rect = currentRange?.getBoundingClientRect?.() || { left:100, top:100, width:200, bottom:120 };
        showBlockedMessage(rect, 'CEO mode blocked — this looks like a security or transactional email.');
        return;
      }

      // Formal document guard (for all modes)
      if (isFormalDocument(text)) {
        const rect = currentRange?.getBoundingClientRect?.() || { left:100, top:100, width:200, bottom:120 };
        showFormalWarning(rect, mode);
        return;
      }

      if (mode === 'rewrite') { handleRewrite(text); return; }
      executeMode(mode);
    });
  }

  function showBlockedMessage(rect, message) {
    destroyAll();
    warnEl = document.createElement('div');
    warnEl.id = 'humanize-warn';
    warnEl.innerHTML = `
      <div class="humanize-warn__title">🚫 Blocked</div>
      <div class="humanize-warn__body">${message}</div>
      <div class="humanize-warn__actions">
        <button class="humanize-warn__cancel">Got it</button>
      </div>`;
    document.body.appendChild(warnEl);
    positionFixed(warnEl, rect);
    requestAnimationFrame(() => warnEl && warnEl.classList.add('humanize-warn--visible'));
    warnEl.querySelector('.humanize-warn__cancel').addEventListener('click', () => {
      pendingMode = null; destroyAll();
    });
  }


  function executeMode(mode) {
    if (!currentSelection || !mode) return;
    let result;
    try {
      if (mode === 'subtle') result = Humanize.subtleMode(currentSelection);
      else if (mode === 'human') result = Humanize.humanMode(currentSelection);
      else if (mode === 'ceo') result = Humanize.ceoMode(currentSelection);
    } catch(e) { console.error('[Humanize]', e); return; }
    // BUG FIX: guard against undefined result before replacing text
    if (!result || typeof result !== 'string') {
      console.error('[Humanize] Transform returned empty/undefined for mode:', mode);
      return;
    }
    incUsage();
    showPreviewCard(result, mode);
  }

  async function handleRewrite(text) {
    const btn = pill?.querySelector('[data-mode="rewrite"]');
    if (btn) { btn.innerHTML = '<span class="humanize-spinner"></span>'; btn.disabled = true; }
    try {
      const result = await Humanize.rewriteMode(text);
      incUsage();
      showPreviewCard(result);
    } catch (err) {
      console.error('[Humanize] Rewrite failed:', err);
      alert('Rewrite failed: ' + err.message);
      if (btn) {
        btn.innerHTML = '<span>✦ Rewrite</span>';
        btn.disabled = false;
        btn.title = 'Rewrite failed: ' + (err.message || 'Chrome AI unavailable');
      }
    }
  }

  function showPreviewCard(result, mode = 'rewrite') {
    if (!pill) return;
    destroyPreviewCard();
    
    const titles = {
      subtle: 'Subtle Mode Preview',
      human: 'Human Mode Preview',
      ceo: 'CEO Mode Preview',
      rewrite: '✦ Rewrite Preview'
    };
    
    previewCard = document.createElement('div');
    previewCard.id = 'humanize-preview';
    previewCard.innerHTML = `
      <div class="humanize-preview__header">${titles[mode] || 'Preview'}</div>
      <div class="humanize-preview__body">${escHtml(result)}</div>
      <div class="humanize-preview__actions">
        <button class="humanize-preview__apply">Apply</button>
        <button class="humanize-preview__copy">Copy</button>
        <button class="humanize-preview__discard">Discard</button>
      </div>`;
    document.body.appendChild(previewCard);

    // Position above pill, but guard against going off top of screen
    const pillTop = parseFloat(pill.style.top);
    const cardH = previewCard.offsetHeight || 200;
    
    let top = pillTop - cardH - 8;
    // If it goes off the top, place it BELOW the pill instead
    if (top < 10) {
      const pillH = pill.offsetHeight || 40;
      top = pillTop + pillH + 8;
    }
    
    previewCard.style.left = pill.style.left;
    previewCard.style.top = top + 'px';
    requestAnimationFrame(() => previewCard && previewCard.classList.add('humanize-preview--visible'));

    previewCard.querySelector('.humanize-preview__apply').addEventListener('click', e => {
      e.stopPropagation();
      replaceText(result);
      destroyAll();
    });
    previewCard.querySelector('.humanize-preview__copy').addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(result).then(() => {
        const btn = previewCard.querySelector('.humanize-preview__copy');
        btn.textContent = 'Copied!';
        setTimeout(() => { if (btn) btn.textContent = 'Copy'; }, 2000);
      });
    });
    previewCard.querySelector('.humanize-preview__discard').addEventListener('click', e => {
      e.stopPropagation();
      destroyPreviewCard();
    });
  }

  function destroyPreviewCard() { if (previewCard) { previewCard.remove(); previewCard = null; } }

  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ── TEXT REPLACEMENT ──
  // Check if the selected content is inside an editable area
  function isEditable(node) {
    if (!node) return false;
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el) {
      if (el.isContentEditable) return true;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return true;
      // Gmail compose uses contenteditable divs
      if (el.getAttribute?.('contenteditable') === 'true') return true;
      if (el.getAttribute?.('role') === 'textbox') return true;
      el = el.parentElement;
    }
    return false;
  }

  function replaceText(newText) {
    const focused = document.activeElement;
    // Textarea / Input path
    if (focused && (focused.tagName === 'TEXTAREA' || focused.tagName === 'INPUT')) {
      const s = focused.selectionStart, e = focused.selectionEnd;
      focused.value = focused.value.slice(0, s) + newText + focused.value.slice(e);
      focused.selectionStart = focused.selectionEnd = s + newText.length;
      focused.dispatchEvent(new Event('input', { bubbles: true }));
      flashElement(focused);
      return;
    }

    // ContentEditable path — only if the range is inside an editable element
    if (currentRange) {
      const rangeNode = currentRange.startContainer;
      if (isEditable(rangeNode)) {
        try {
          currentRange.deleteContents();
          const node = document.createTextNode(newText);
          currentRange.insertNode(node);
          const sel = window.getSelection();
          const nr = document.createRange();
          nr.setStartAfter(node); nr.collapse(true);
          sel.removeAllRanges(); sel.addRange(nr);
          flashNode(node);
          return;
        } catch (err) {
          console.warn('[Humanize] Range replacement failed:', err);
        }
      }
    }

    // Fallback for non-editable content: copy to clipboard and show notification
    navigator.clipboard.writeText(newText).then(() => {
      showCopiedNotification();
    }).catch(() => {
      // Last resort: use textarea hack
      const ta = document.createElement('textarea');
      ta.value = newText;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showCopiedNotification();
    });
  }

  function showCopiedNotification() {
    const note = document.createElement('div');
    note.id = 'humanize-copied-note';
    note.textContent = '✓ Humanized text copied to clipboard — paste it where you need it';
    note.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      z-index:2147483647; background:#1a1a1a; color:#fff;
      padding:10px 20px; border-radius:10px; font-size:13px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-shadow:0 4px 16px rgba(0,0,0,0.3); animation:humanize-slide-up 0.25s ease;
    `;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }

  function flashElement(el) {
    const orig = el.style.backgroundColor;
    el.style.transition = 'background-color 0.1s';
    el.style.backgroundColor = '#d1fae5';
    setTimeout(() => { el.style.backgroundColor = orig; }, 800);
  }

  function flashNode(node) {
    const span = document.createElement('span');
    span.style.cssText = 'background:#d1fae5;border-radius:2px;transition:background 0.8s ease;';
    node.parentNode?.insertBefore(span, node);
    span.appendChild(node);
    setTimeout(() => { span.style.background = 'transparent'; setTimeout(() => { span.parentNode?.replaceChild(node, span); }, 800); }, 50);
  }

  // ── UPGRADE BANNER ──
  function showUpgradeBanner() {
    if (document.getElementById('humanize-upgrade-banner')) return;
    const b = document.createElement('div');
    b.id = 'humanize-upgrade-banner';
    b.innerHTML = `<span>You've used 3 free humanizations.</span>
      <a href="#" class="humanize-upgrade-link">Upgrade for unlimited →</a>
      <button class="humanize-upgrade-close" aria-label="Close">✕</button>`;
    b.querySelector('.humanize-upgrade-close').addEventListener('click', () => b.remove());
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 8000);
  }

  // ── UNIVERSAL SELECTION DETECTION ──
  let selTimer = null, lastText = '', lastRect = null;
  let lastMousePos = { x: 0, y: 0 };

  // Track mouse position for fallback pill positioning
  document.addEventListener('pointermove', e => {
    lastMousePos.x = e.clientX;
    lastMousePos.y = e.clientY;
  }, { passive: true });

  function onSelectionChange() {
    // Block if dismissed or site not allowed
    if (dismissedUntilReload) return;
    if (siteCheckDone && !currentSiteAllowed) return;

    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const sel = window.getSelection();
      
      // IGNORE selections that happen inside our own UI (fixes copy/scroll bug)
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).startContainer;
        if (node.nodeType === 3) node = node.parentNode;
        if (pill?.contains(node) || previewCard?.contains(node) || warnEl?.contains(node)) {
          return;
        }
      }

      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        if (!pill?.matches(':hover') && !warnEl?.matches(':hover')) {
          lastText = '';
          // Don't destroy immediately — user might be interacting with pill
        }
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 40 || text.length > 5000) return;
      if (text === lastText) return;
      lastText = text;
      currentSelection = text;
      try { currentRange = sel.getRangeAt(0).cloneRange(); } catch { return; }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      lastRect = rect;

      Humanize.isRewriteAvailable().then(ok => createPill(rect, ok));
    }, 250);
  }

  document.addEventListener('selectionchange', onSelectionChange);

  // Backup: pointerup fires reliably even when selectionchange is swallowed
  document.addEventListener('pointerup', () => setTimeout(onSelectionChange, 100));

  // ── KEYBOARD SHORTCUT Ctrl+Shift+H ──
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length >= 10) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        currentSelection = sel.toString().trim();
        try { currentRange = sel.getRangeAt(0).cloneRange(); } catch {}
        Humanize.isRewriteAvailable().then(ok => createPill(rect, ok));
      }
    }
    if (e.key === 'Escape') destroyAll();
  });

  // ── DISMISS ──
  document.addEventListener('mousedown', e => {
    if (pill && !pill.contains(e.target) && !warnEl?.contains(e.target) && !previewCard?.contains(e.target)) {
      destroyAll();
      lastText = '';
    }
  });

  window.addEventListener('scroll', () => {
    // Reposition pill on scroll instead of destroying it
    if (pill && currentRange) {
      try {
        const rect = currentRange.getBoundingClientRect();
        if (rect && rect.width > 0) positionFixed(pill, rect);
      } catch {}
    }
  }, { passive: true });

})();
