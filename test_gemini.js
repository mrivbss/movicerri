require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyAZl_cJ22u-EQT1drRaKgpTGJX5lwb1Xnk" });

async function test() {
    try {
        console.log("Testing with hardcoded key...");
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
