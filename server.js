const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Esto le dice a Express que todos los archivos estáticos están en 'public'
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡Servidor listo! Revisa tu web en: http://localhost:${PORT}`);
});