(function() {
    if (window.__lexiguard_injected) return;
    window.__lexiguard_injected = true;

    const iframe = document.createElement('iframe');
    iframe.id = 'lexiguard_sidebar';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.right = '0';
    iframe.style.width = '420px';
    iframe.style.height = '100vh';
    iframe.style.border = '0';
    iframe.style.zIndex = '9999999';
    iframe.style.boxShadow = '0 0 12px rgba(0,0,0,0.2)';
    iframe.style.display = 'none';
    iframe.src = chrome.runtime.getURL('sidebar.html');
    document.documentElement.appendChild(iframe);

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === 'TOGGLE_SIDEBAR') {
            iframe.style.display = (iframe.style.display === 'none') ? 'block' : 'none';
        }

        if (msg.type === 'SIDEBAR_READY') {
            analyzePageText();
        }
        return true;
    });

    function analyzePageText() {
        const selectors = ['main', 'article', '#terms', '#terms-of-service', 'body'];
        let text = '';
        for (const s of selectors) {
            const el = document.querySelector(s);
            if (el && el.innerText && el.innerText.length > 1000) {
                text = el.innerText;
                break;
            }
        }
        if (!text) {
            text = document.body.innerText.slice(0, 40000);
        }
        iframe.contentWindow.postMessage({ type: 'PAGE_TEXT', text: text }, chrome.runtime.getURL(''));
    }
})();