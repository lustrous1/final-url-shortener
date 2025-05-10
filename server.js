const express = require("express");
const { nanoid } = require("nanoid");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create short URL
app.post("/shorten", (req, res) => {
  const longUrl = req.body.url;
  if (!longUrl) return res.status(400).json({ error: "URL is required" });

  const id = nanoid(6);
  db.run("INSERT INTO urls (id, long_url) VALUES (?, ?)", [id, longUrl], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const base = req.headers.origin || `http://localhost:${PORT}`;
    res.json({ shortUrl: `${base}/${id}` });
  });
});

// Redirect
app.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT long_url FROM urls WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).send("Not found");
    res.redirect(row.long_url);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
