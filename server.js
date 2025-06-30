const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const fileInfo = {
    filename: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
  };

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync("data.json", "utf-8") || "[]");
  } catch (e) {
    data = [];
  }

  data.push(fileInfo);

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.redirect("/");
});

app.get("/data", (req, res) => {
  const data = fs.readFileSync("data.json", "utf-8");
  res.setHeader("Content-Type", "application/json");
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
