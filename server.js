const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

// File upload settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileInfo = {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    const data = await fs.readJSON("data.json");
    data.push(fileInfo);
    await fs.writeJSON("data.json", data, { spaces: 2 });

    res.status(200).json({ success: true, file: fileInfo });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// Get all files
app.get("/files", async (req, res) => {
  try {
    const data = await fs.readJSON("data.json");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
