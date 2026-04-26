require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hola',
        });
        console.log('Success:', response.text);
    } catch (error) {
        console.error('Error details:', error);
    }
}
test();
