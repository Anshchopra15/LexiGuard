// LLM-backed Node/Express server for LexiGuard
// server.js (Corrected Version)
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Use dotenv to load environment variables
const OpenAI = require('openai').default;

const app = express();
// Increase the payload size limit if you expect large legal texts
app.use(express.json({ limit: '5mb' })); 
app.use(cors());

// Check for API key on startup
if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY environment variable is not set.");
    process.exit(1); // Exit if no key is found
}

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Test route
app.get('/', (req, res) => {
    res.send('LexiGuard server is live!');
});

// /analyze route
app.post('/analyze', async (req, res) => {
    try {
        const text = req.body.text || '';
        if (text.length < 100) { // Basic validation
             return res.status(400).json({ error: "Text is too short to analyze." });
        }

        const prompt = `You are LexiGuard, an AI legal assistant. Analyze the following legal text.
Summarize it in simple terms (max 5 sentences). Then, extract up to 5 critical clauses.
For each clause, provide a title, a short excerpt from the text, and a risk level (high, mid, or low).

ALWAYS format your entire response as a single, valid JSON object with two keys: "summary" (a string) and "clauses" (an array of objects, where each object has "title", "excerpt", and "risk" keys). Do not include any text or formatting outside of this JSON object.

Legal Text:\n${text}\n`;

        const resp = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                // The system message is better for setting the AI's persona
                { role: "system", content: "You are a helpful legal AI assistant that only responds with valid JSON." },
                { role: "user", content: prompt }
            ],
            // Use JSON Mode for guaranteed valid JSON output
            response_format: { type: "json_object" }, 
            temperature: 0.2
        });

        const raw = resp.choices[0].message.content;
        
        // With JSON mode, this parse should be reliable
        res.json(JSON.parse(raw)); 

    } catch (e) {
        console.error("Error in /analyze:", e);
        res.status(500).json({ error: "Failed to analyze text.", details: e.message });
    }
});


// /ask route (This route was already good, no major changes needed)
app.post('/ask', async (req, res) => {
    try {
        const { text, question } = req.body;
        if (!text || !question) {
             return res.status(400).json({ error: "Both text and question are required." });
        }

        const prompt = `You are LexiGuard, an AI legal assistant. Based *only* on the legal text provided below, answer the user's question. Be concise and clear. If the answer is not in the text, say so.

Legal Text:\n${text}\n\nQuestion: ${question}`;

        const resp = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an AI legal assistant." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        });

        const answer = resp.choices[0].message.content;
        res.json({ answer });

    } catch (e) {
        console.error("Error in /ask:", e);
        res.status(500).json({ error: "Failed to get answer.", details: e.message });
    }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LexiGuard server running on http://localhost:${PORT}`));