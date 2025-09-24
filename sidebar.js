// sidebar.js (with Your NEW Custom Fake Data)

let lastText = '';

window.parent.postMessage({ type: 'SIDEBAR_READY' }, '*');

window.addEventListener('message', async (ev) => {
    if (ev.source !== window.parent) {
        return;
    }
    const msg = ev.data || {};
    if (msg.type === 'PAGE_TEXT') {
        lastText = msg.text || '';
        document.getElementById('status').innerText = 'Analyzing...';
        analyze(lastText);
    }
});

async function analyze(text) {
    try {
        // --- START OF FAKE DATA SECTION ---
        // This is your new custom summary and clauses.
        
        const j = {
            summary: "The services may change or stop at any time, and you must follow usage rules and applicable laws.",
            clauses: [
                { title: "Content Licensing", excerpt: "You retain ownership of your content but grant X a broad license to use, modify, and distribute it without compensation.", risk: "high" },
                { title: "Content & Account Removal", excerpt: "X may remove content or suspend accounts at its discretion.", risk: "high" },
                { title: "Content Liability", excerpt: "You're responsible for the content you post and may encounter offensive or misleading material.", risk: "mid" },
                { title: "Data Privacy", excerpt: "X can collect, use, and transfer your data internationally as outlined in its Privacy Policy.", risk: "mid" }
            ]
        };
        
        // This setTimeout makes it look like it's "thinking" for 1 second.
        setTimeout(() => {
            document.getElementById('status').innerText = '';
            document.getElementById('summary').innerHTML = '<h3>Summary</h3><p>' + escapeHtml(j.summary) + '</p>';
            const list = document.getElementById('clauseList');
            list.innerHTML = '<h3>Key Clauses</h3>';
            j.clauses.forEach(c => {
                const d = document.createElement('div');
                d.className = 'clause ' + c.risk; // This will set the color (high, mid, low)
                d.innerHTML = '<strong>' + escapeHtml(c.title) + '</strong><div>' + escapeHtml(c.excerpt) + '</div><div><em>Risk: ' + escapeHtml(c.risk) + '</em></div>';
                list.appendChild(d);
            });
        }, 1000);
        // --- END OF FAKE DATA SECTION ---

    } catch (e) {
        console.error("Analysis error:", e);
        document.getElementById('status').innerText = 'Analysis error. Please check the server.';
    }
}

// The "Ask" function is disabled.
document.getElementById('ask').addEventListener('click', async () => {
    document.getElementById('answer').innerText = 'This feature requires a live server connection.';
});

function escapeHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}