const express = require('express');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend (UI)
app.use(express.static(path.join(__dirname, 'public')));

// Multer temp storage setup
const upload = multer({ dest: 'temp_uploads/' });

// File upload API route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    // 🔗 Send to your backup storage
    const response = await axios.post(
      'https://drive-main-storage.onrender.com/upload',
      form,
      { headers: form.getHeaders() }
    );

    // Remove temp file after upload
    fs.unlinkSync(req.file.path);

    // Return uploaded file URL
    res.json({
      message: '✅ File uploaded successfully!',
      url: response.data.url
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: '❌ Failed to upload to storage' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Main App running on http://localhost:${port}`);
});
