// background.js
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-pill') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'H', ctrlKey: true, shiftKey: true, bubbles: true
          }))
        });
      }
    });
  }
});

// Handle opening chrome:// URLs from popup (popups can't open these directly)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'open-chrome-flags') {
    chrome.tabs.create({ url: 'chrome://flags/#prompt-api-for-gemini-nano' });
  }
});
