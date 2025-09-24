document.getElementById('analyze').addEventListener('click', async () => {
    // 1. Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Send a message to the content script to toggle the sidebar
    // The content script will handle the rest.
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });

    // 3. Close the popup
    window.close();
});