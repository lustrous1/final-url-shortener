const express = require("express");
const { nanoid } = require("nanoid");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create short URL
app.post("/shorten", (req, res) => {
  const longUrl = req.body.url;
  const id = nanoid(6);

  db.run("INSERT INTO urls (id, long_url) VALUES (?, ?)", [id, longUrl], function (err) {
    if (err) return res.status(500).send("Database error.");
    res.json({ shortUrl: `${req.headers.origin}/${id}` });
  });
});

// Redirect to long URL
app.get("/:id", (req, res) => {
  const id = req.params.id;

  db.get("SELECT long_url FROM urls WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).send("URL not found.");
    res.redirect(row.long_url);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
