const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Multer temp storage
const upload = multer({ dest: 'temp_uploads/' });

// Upload route: frontend → this server → backup storage
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    // ✅ তোমার backup storage server
    const storageURL = 'https://drive-main-storage.onrender.com/upload';

    // Send file to backup storage
    const response = await axios.post(storageURL, form, {
      headers: form.getHeaders()
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    // Return final file URL from backup server
    res.json({
      message: '✅ File uploaded successfully to backup storage',
      url: response.data.url // Example: /uploads/filename.jpg
    });

  } catch (error) {
    console.error('Upload failed:', error.message);
    res.status(500).json({ error: '❌ Failed to upload to storage server' });
  }
});

// Optional: homepage
app.get('/', (req, res) => {
  res.send('✅ Main App connected to Backup Storage');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Main App running at http://localhost:${port}`);
});
