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
        const resp = await fetch('https://lexiguard-two.vercel.app/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.slice(0, 40000) })
        });
        if (!resp.ok) {
            throw new Error(`Server responded with status: ${resp.status}`);
        }
        const j = await resp.json();
        document.getElementById('status').innerText = '';
        document.getElementById('summary').innerHTML = '<h3>Summary</h3><p>' + escapeHtml(j.summary || 'No summary provided.') + '</p>';
        const list = document.getElementById('clauseList');
        list.innerHTML = '<h3>Key Clauses</h3>';
        if (j.clauses && j.clauses.length > 0) {
            j.clauses.forEach(c => {
                const d = document.createElement('div');
                d.className = 'clause ' + (c.risk === 'high' ? 'high' : c.risk === 'mid' ? 'mid' : 'low');
                d.innerHTML = '<strong>' + escapeHtml(c.title) + '</strong><div>' + escapeHtml(c.excerpt) + '</div><div><em>Risk: ' + escapeHtml(c.risk) + '</em></div>';
                list.appendChild(d);
            });
        } else {
            list.innerHTML += '<p>No specific clauses were extracted.</p>';
        }
    } catch (e) {
        console.error("Analysis error:", e);
        document.getElementById('status').innerText = 'Analysis error. Please check the server.';
    }
}

document.getElementById('ask').addEventListener('click', async () => {
    const q = document.getElementById('question').value.trim();
    if (!q) return;
    document.getElementById('answer').innerText = 'Thinking...';
    try {
        const resp = await fetch('https://lexiguard-two.vercel.app/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: lastText, question: q })
        });
        if (!resp.ok) {
            throw new Error(`Server responded with status: ${resp.status}`);
        }
        const j = await resp.json();
        document.getElementById('answer').innerText = j.answer || 'No answer found.';
    } catch (e) {
        console.error("Ask error:", e);
        document.getElementById('answer').innerText = 'Server error.';
    }
});

function escapeHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}