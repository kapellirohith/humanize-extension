<div align="center">
  <img src="icons/icon128.png" alt="WriteHuman Logo" width="80"/>
  <h1>WriteHuman — Chrome Extension</h1>
  <p><strong>Transform AI-written text into natural, human-sounding prose instantly.</strong></p>
  
  [![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=Google-Chrome&logoColor=white)](#)
  [![100% Offline](https://img.shields.io/badge/Offline-100%25-success?style=flat)](#)
  [![Gemini Nano](https://img.shields.io/badge/AI-Gemini_Nano-8A2BE2?style=flat)](#)
  [![Zero Data Collected](https://img.shields.io/badge/Privacy-Zero_Data_Collected-green?style=flat)](#)
</div>

---

## 🚀 What is WriteHuman?
AI text is fast, but it often sounds robotic, overly formal, and full of buzzwords ("delve", "leverage", "seamless"). **WriteHuman** is a Chrome extension that lives right on your webpage. Select any block of text, click the pop-up pill, and instantly strip away the "AI flavor" so it sounds like a real person wrote it at their desk.

* **No API Keys.**
* **No external servers.** 
* **100% On-Device execution.**

---

## ✨ Features & Modes

| Mode | Behavior | Best For |
|---|---|---|
| 🪶 **Subtle** | Strips out AI buzzwords, adds natural contractions, and injects exactly one realistic human typo. | Professional emails where you just want to remove the "AI stink". |
| 🙋 **Human** | Everything in Subtle, plus rhythm variation, casual connectors ("Anyway," "Heads up —"), and softened closings. | Slack messages, internal team updates, informal emails. |
| ⚡ **CEO `PRO`** | Extremely short. Brutally concise. All lowercase. | Replying from your phone between meetings. |
| ✦ **Rewrite** | A full, intelligent rewrite using Chrome's newly built-in **Gemini Nano AI model** (Requires Chrome 127+). | Completely restructuring the paragraph. |

---

## 🛠 Installation (Developer Mode)

1. Clone this repository or download the ZIP.
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** via the toggle in the top right.
4. Click **Load unpacked** and select the `writehuman-extension` folder.
5. Pin the ✦ icon to your browser toolbar!

> **Pro Tip:** Press `Ctrl + Shift + H` (or `Cmd + Shift + H` on Mac) to instantly trigger the WriteHuman pill on your current text selection.

---

## 🤖 Enabling Gemini Nano (✦ Rewrite Mode)

The `Rewrite` mode takes advantage of Google's new **Prompt API** to run the Gemini Nano LLM entirely on your local GPU/CPU. 

1. Ensure you are on Chrome version 127 or newer.
2. Go to `chrome://flags`
3. Search for **Prompt API for Gemini Nano** and set it to **Enabled**.
4. Search for **Optimization Guide On Device Model** and set it to **Enabled BypassPrefRequirement**.
5. Relaunch Chrome.
6. (Optional but recommended) Go to `chrome://components`, find *Optimization Guide On Device Model*, and click **Check for Update** to ensure the model downloads (~1.5GB).

---

## 🔒 Privacy & Security

**Zero data leaves your device. Ever.** 
Unlike other AI tools that beam your private emails and documents to remote servers, WriteHuman processes text locally. The Subtle, Human, and CEO modes rely on a robust custom RegExp engine, and the Rewrite mode utilizes your browser's local AI weights.

---

## 📂 Project Structure

```text
writehuman-extension/
├── manifest.json     — Extension configurations (Manifest V3)
├── humanize.js       — Core transform engine (buzzword mapping, syntax rewriting)
├── content.js        — DOM injection, floating pill UI, text extraction/replacement
├── styles.css        — UI styling (Pill, dialog boxes, upgrade banners)
├── popup.html        — Extension settings interface
├── popup.js          — Usage stats logic and Chrome AI diagnostics
└── background.js     — Service worker for global keyboard shortcuts
```
