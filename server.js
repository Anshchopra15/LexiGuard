const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());

if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.get('/', (req, res) => {
    res.send('LexiGuard server is live!');
});

app.post('/analyze', async (req, res) => {
    try {
        const text = req.body.text || '';
        if (text.length < 100) {
            return res.status(400).json({ error: "Text is too short to analyze." });
        }
        const prompt = `You are LexiGuard, an AI legal assistant. Analyze the following legal text. Summarize it in simple terms (max 5 sentences). Then, extract up to 5 critical clauses. For each clause, provide a title, a short excerpt from the text, and a risk level (high, mid, or low). ALWAYS format your entire response as a single, valid JSON object with two keys: "summary" (a string) and "clauses" (an array of objects, where each object has "title", "excerpt", and "risk" keys). Do not include any text or formatting outside of this JSON object. Legal Text:\n${text}\n`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text();
        const cleanedJsonString = raw.replace(/^```json\s*|```$/g, '');
        res.json(JSON.parse(cleanedJsonString));
    } catch (e) {
        console.error("Error in /analyze:", e);
        res.status(500).json({ error: "Failed to analyze text.", details: e.message });
    }
});

app.post('/ask', async (req, res) => {
    try {
        const { text, question } = req.body;
        if (!text || !question) {
            return res.status(400).json({ error: "Both text and question are required." });
        }
        const prompt = `Based *only* on the legal text provided below, answer the user's question. Be concise and clear. If the answer is not in the text, say so. Legal Text:\n${text}\n\nQuestion: ${question}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();
        res.json({ answer });
    } catch (e) {
        console.error("Error in /ask:", e);
        res.status(500).json({ error: "Failed to get answer.", details: e.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LexiGuard server running on http://localhost:${PORT}`));