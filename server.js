const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

// ✅ Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 🔗 গুদাম backend URL – এটা তোমার গুদামের actual Render URL
const STORAGE_URL = 'https://drive-main-storage.onrender.com';

// 📤 File upload setup – temp folder
const upload = multer({ dest: 'temp/' });

// 📤 POST /upload → ফাইল গুদামে পাঠাও
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(req.file.path);
    form.append('file', fileStream, req.file.originalname);

    const response = await axios.post(`${STORAGE_URL}/upload`, form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(req.file.path); // temp ফাইল মুছে ফেলো
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// 📥 GET /data → গুদাম থেকে সব ফাইলের ডেটা আনো
app.get('/data', async (req, res) => {
  try {
    const response = await axios.get(`${STORAGE_URL}/data`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data', details: err.message });
  }
});

// 🏠 Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Drive UI client running on port ${PORT}`);
});
