const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // O el puerto que estés utilizando

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
