# Humanize — Chrome Extension

> Transform AI-written text into natural human-sounding text.  
> No API. No backend. Works 100% offline.

---

## How It Works

1. Select any text on any webpage (Gmail, Outlook, ChatGPT, Google Docs, etc.)
2. A small pill appears above your selection
3. Pick a mode — the text is rewritten **in-place instantly**

---

## Modes

| Mode | What it does |
|---|---|
| 🪶 **Subtle** | Removes AI buzzwords, adds contractions, inserts one realistic typo. Reads like a sharp human editor touched it. |
| 🙋 **Human** | Everything in Subtle + rhythm variation, casual connectors ("Anyway,", "Heads up —"), softened closing. Clearly typed by a real person. |
| ⚡ **CEO** | Ultra-short. Lowercase. Blunt. Exec replying from phone between meetings. |
| ✦ **Rewrite** | Full intelligent rewrite via Chrome's built-in Gemini Nano. Zero API cost. Zero external calls. 100% local. |

---

## Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `humanize-extension` folder
5. Pin the extension to your toolbar

**Keyboard shortcut:** `Ctrl + Shift + H` to open the pill on your current selection.

---

## Enabling ✦ Rewrite Mode (Chrome Built-in AI)

Rewrite mode uses Chrome's built-in Gemini Nano — no API key needed.

1. Open Chrome 127 or later
2. Go to `chrome://flags`
3. Enable **"Prompt API for Gemini Nano"**
4. Enable **"Optimization Guide On Device Model"**
5. Restart Chrome
6. Go to `chrome://components` → find **"Optimization Guide On Device Model"** → click **Check for Update**
7. Wait for the model to download (~1-3 GB)
8. The ✦ Rewrite button will automatically activate

> The other 3 modes (Subtle, Human, CEO) work without this — fully offline, always.

---

## Works On

- ✅ Gmail compose
- ✅ Outlook Web
- ✅ Any `<textarea>` or `<input>`
- ✅ Any `contenteditable` element (Google Docs, Notion, etc.)
- ✅ Any webpage

---

## Privacy & Security

- **Zero data leaves your device.** Ever.
- All transforms run locally in your browser tab.
- Chrome AI (Rewrite mode) also runs 100% on-device.
- Usage count is stored in `chrome.storage.local` — never synced externally.

---

## Project Structure

```
humanize-extension/
├── manifest.json     — MV3 manifest
├── humanize.js       — Core transform engine (all replacements, typos, CEO logic)
├── content.js        — Pill UI, selection detection, text replacement
├── styles.css        — Pill, preview card, upgrade banner styles
├── popup.html        — Extension popup
├── popup.js          — Usage stats, Chrome AI status
├── background.js     — Keyboard shortcut relay
└── icons/            — Extension icons
```
