const express = require("express");
const router = express.Router();
const parser = require("../utils/upload");

router.post("/upload", parser.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  res.json({ url: file.path, public_id: file.filename });
});

module.exports = router;
