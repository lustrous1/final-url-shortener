const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("urls.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      long_url TEXT NOT NULL
    )
  `);
});

module.exports = db;
