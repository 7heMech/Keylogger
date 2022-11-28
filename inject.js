chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.startsWith("chrome://")) return;
  if (changeInfo.status === 'complete') {
    console.log(changeInfo)
    chrome.scripting.executeScript(
      {
        target: {tabId, allFrames: true},
        files: ['script.js'],
      }
    );
  }
});