const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); // তোমার index.html থাকলে এখানে রাখো
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ফাইল সার্ভ

// ফাইল আপলোড সেটআপ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ফাইল আপলোড রুট
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    filename: req.file.originalname,
    path: fileUrl
  });
});

// ফাইল লিস্ট দেখানোর রুট
app.get('/data', (req, res) => {
  const dirPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(dirPath)) {
    return res.json([]);
  }

  fs.readdir(dirPath, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read files' });

    const fileData = files.map(filename => ({
      filename,
      path: `/uploads/${filename}`
    }));

    res.json(fileData.reverse()); // নতুন ফাইল আগে দেখাবে
  });
});

// সার্ভার চালু
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
