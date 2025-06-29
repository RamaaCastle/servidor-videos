const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita CORS para permitir acceso desde la tele
app.use(cors());

// Carpeta donde se guardarán los videos
const UPLOADS_FOLDER = path.join(__dirname, 'videos');
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/ping', (req, res) => {
  res.send('pong');
});


// Configurar Multer para almacenar videos
const storage = multer.diskStorage({
    destination: UPLOADS_FOLDER,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// 📌 Hacer que la carpeta "public" sirva archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// 📌 Servir la pantalla de reproducción full-screen
app.get('/pantalla', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'full-screen.html'));
});

// 📌 Ruta para subir videos
app.post('/upload', upload.single('video'), (req, res) => {
    console.log(`✅ Video subido: ${req.file.filename}`);
    res.json({ message: 'Video subido con éxito', filename: req.file.filename });
});

// 📌 Ruta para obtener lista de videos
app.get('/videos', (req, res) => {
    fs.readdir(UPLOADS_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los videos' });
        }
        res.json(files);
    });
});

// 📌 Servir videos almacenados en la carpeta
app.use('/videos', express.static(UPLOADS_FOLDER));

// 📌 Ruta para eliminar videos
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_FOLDER, req.params.filename);
    
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el video' });
        }
        console.log(`🗑️ Video eliminado: ${req.params.filename}`);
        res.json({ message: 'Video eliminado con éxito' });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`🎬 Ver pantalla completa en: /pantalla`);
});

