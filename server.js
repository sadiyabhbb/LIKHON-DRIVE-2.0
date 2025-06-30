const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  // Read existing data
  let existingData = [];
  try {
    const fileContent = fs.readFileSync("data.json", "utf-8");
    existingData = JSON.parse(fileContent || "[]");
  } catch (err) {
    console.error("Read error:", err);
  }

  // Push new file data
  const fileInfo = {
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
  };
  existingData.push(fileInfo);

  // Save updated data
  fs.writeFileSync("data.json", JSON.stringify(existingData, null, 2));
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
