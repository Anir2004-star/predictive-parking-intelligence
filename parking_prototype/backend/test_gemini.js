const { GoogleGenAI } = require('@google/genai');

const apiKey = "YOUR_API_KEY_HERE";

const ai = new GoogleGenAI({ apiKey: apiKey });

async function test() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Hello",
        });
        console.log("SUCCESS:", response.text);
    } catch (error) {
        console.error("ERROR:", error);
    }
}
test();
