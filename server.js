const express = require('express');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ dest: 'temp_uploads/' });

// Upload route: send file to backup server
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(
      'https://drive-main-storage.onrender.com/upload',
      form,
      { headers: form.getHeaders() }
    );

    fs.unlink(req.file.path, () => {}); // delete temp
    res.json({ url: response.data.url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed to backup server' });
  }
});

// Proxy route: hide actual backup link
app.get('/drive-files/:file', async (req, res) => {
  const filePath = req.params.file;
  const backupURL = `https://drive-main-storage.onrender.com/uploads/${filePath}`;

  try {
    const response = await axios.get(backupURL, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (err) {
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`🚀 Main App running on http://localhost:${port}`);
});
