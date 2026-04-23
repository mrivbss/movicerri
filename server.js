const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 1. Esto le dice a Express que todos los archivos estáticos están en 'public'
app.use(express.static('public'));

// 2. Aquí es donde estaba el error. Hay que decirle que el index está DENTRO de public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡Servidor listo! Revisa tu web en: http://localhost:${PORT}`);
});