// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
      // Execute script in the tab to capture the specified element
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab) {
          sendResponse({ error: "No active tab found" });
          return;
        }
  
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: captureElement,
          args: [request.elementSelector]
        }).then(results => {
          if (results && results[0] && results[0].result) {
            sendResponse({ dataUrl: results[0].result });
          } else {
            sendResponse({ error: "Failed to capture element" });
          }
        }).catch(error => {
          console.error("Error executing script:", error);
          sendResponse({ error: error.message });
        });
      });
  
      // Return true to indicate we will send a response asynchronously
      return true;
    }
  });
  
  // Function to be injected into the page to capture the element
  function captureElement(selector) {
    return new Promise((resolve, reject) => {
      try {
        const element = document.querySelector(selector);
        if (!element) {
          reject("Element not found");
          return;
        }
  
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        // Use html2canvas for the actual rendering
        html2canvas(element).then(renderedCanvas => {
          resolve(renderedCanvas.toDataURL('image/png'));
        }).catch(error => {
          reject(error.message);
        });
      } catch (error) {
        reject(error.message);
      }
    });
  }