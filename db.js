const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(__dirname, "urls.db");
// Or if using a Render disk:
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      long_url TEXT NOT NULL
    )
  `);
});

module.exports = db;
