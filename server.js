require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;

app.use(express.json());
// 1. Esto le dice a Express que todos los archivos estáticos están en 'public'
app.use(express.static('public'));

// Configuración de Gemini AI
// Se asume que process.env.GEMINI_API_KEY tiene la clave
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint para el chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

        const systemInstruction = `Eres el asistente virtual de MOVICERRI, un sistema inteligente de la comuna de Cerrillos, Chile, que detecta aglomeraciones usando cámaras e IA para avisar a la municipalidad y aumentar la frecuencia de los buses.
Tus funciones son responder preguntas ÚNICAMENTE sobre:
1. Cómo funciona MOVICERRI (detección de aglomeraciones con IA).
2. Los recorridos principales de buses: I14, I18, I01.
3. El sistema de reportes ciudadanos (donde los usuarios pueden reportar incidentes).
4. La consulta de saldo de la tarjeta BIP y la cuenta del usuario.
Si el usuario pregunta sobre cualquier otro tema (historia, programación, recetas, matemáticas, o cualquier cosa fuera de MOVICERRI y transporte en Cerrillos), debes responder amablemente que eres el asistente exclusivo de MOVICERRI y que solo puedes ayudar con temas relacionados a la plataforma y el transporte de Cerrillos.
Sé breve, amable y utiliza un lenguaje claro. Ocupa emojis.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: { systemInstruction }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Error con Gemini API:', error);
        res.status(500).json({ error: 'Lo siento, hubo un problema al conectar con la IA. Por favor intenta más tarde.' });
    }
});

// 2. Aquí es donde estaba el error. Hay que decirle que el index está DENTRO de public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡Servidor listo! Revisa tu web en: http://localhost:${PORT}`);
});