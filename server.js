const express = require('express');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend (e.g. index.html inside /public)
app.use(express.static(path.join(__dirname, 'public')));

// Temp upload folder
const upload = multer({ dest: 'temp_uploads/' });

// Upload route - sends file to Backup Storage
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '❌ No file uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post(
      'https://drive-main-storage.onrender.com/upload',
      form,
      { headers: form.getHeaders() }
    );

    // Remove the temp file after sending
    fs.unlink(req.file.path, err => {
      if (err) console.error('Temp cleanup failed:', err);
    });

    res.json({
      message: '✅ File uploaded successfully!',
      url: response.data.url
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: '❌ Failed to upload to backup storage' });
  }
});

// Proxy route: serve backup files without showing backup URL
app.get('/drive-files/:file', async (req, res) => {
  const filePath = req.params.file;
  const backupURL = `https://drive-main-storage.onrender.com/uploads/${filePath}`;

  try {
    const response = await axios.get(backupURL, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (err) {
    res.status(404).send('❌ File not found in backup');
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Main App running at http://localhost:${port}`);
});
