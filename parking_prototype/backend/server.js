const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint to get hotspots
app.get('/api/hotspots', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'hotspots.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Hotspots data not found. Please run the data pipeline first." });
        }

        const rawData = fs.readFileSync(filePath);
        const data = JSON.parse(rawData);

        res.json(data);
    } catch (error) {
        console.error("Error reading hotspots data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Import Gemini SDK (User must replace YOUR_API_KEY_HERE with a real key)
const { GoogleGenAI } = require('@google/genai');

app.post('/api/chat', async (req, res) => {
    try {
        const { message, messages, systemInstruction } = req.body;

        // IMPORTANT: Replace with real Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";

        if (apiKey === "YOUR_API_KEY_HERE") {
            return res.json({
                reply: "⚠️ **API KEY MISSING!** I am the High-Powered GenAI, but you need to paste your Gemini API Key into `backend/server.js` to activate my neural nets!"
            });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        let contents;
        if (messages && Array.isArray(messages)) {
            contents = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
        } else {
            contents = message;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("GenAI Error:", error);
        res.status(500).json({ reply: "Sorry, I encountered an error connecting to the AI models." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
