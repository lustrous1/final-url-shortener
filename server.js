const express = require("express");
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.use(express.json());
app.use(express.static("public"));

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    long_url TEXT NOT NULL
  );
`);

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create a short URL
app.post("/shorten", async (req, res) => {
  const longUrl = req.body.url;
  if (!longUrl) return res.status(400).json({ error: "URL is required" });

  const id = nanoid(6);
  try {
    await pool.query("INSERT INTO urls (id, long_url) VALUES ($1, $2)", [id, longUrl]);
    const base = req.headers.origin || `http://localhost:${PORT}`;
    res.json({ shortUrl: `${base}/${id}` });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Redirect to the long URL
app.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT long_url FROM urls WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.redirect(result.rows[0].long_url);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (err) {
    res.status(500).send("Database error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
