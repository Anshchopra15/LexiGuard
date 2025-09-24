// server.js (Modified for Google Gemini)

const express = require('express');
const cors = require('cors');
require('dotenv').config();
// ⬇️ 1. Import the new client
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());

// ⬇️ 2. Use the Google API key from your environment variables
if (!process.env.GEMINI_API_KEY) { 
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
}

// ⬇️ 3. Initialize the Google client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

app.get('/', (req, res) => {
    res.send('LexiGuard server is live!');
});

app.post('/analyze', async (req, res) => {
    try {
        const text = req.body.text || '';
        if (text.length < 100) {
            return res.status(400).json({ error: "Text is too short to analyze." });
        }

        const prompt = `You are LexiGuard... (Your original prompt is fine, just remember to ask for JSON output)`;

        // ⬇️ 4. Call the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text();
        
        // Remove markdown backticks if the model includes them
        const cleanedJsonString = raw.replace(/^```json\s*|```$/g, '');
        
        res.json(JSON.parse(cleanedJsonString));

    } catch (e) {
        console.error("Error in /analyze:", e);
        res.status(500).json({ error: "Failed to analyze text.", details: e.message });
    }
});

// ... (you can update the /ask route similarly)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`LexiGuard server running on http://localhost:${PORT}`));