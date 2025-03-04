const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    is_creator BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER,
    sport TEXT,
    pick TEXT,
    odds TEXT,
    result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(creator_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    user_id INTEGER,
    creator_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(creator_id) REFERENCES users(id)
  )`);

  db.run(`ALTER TABLE picks ADD COLUMN game_time TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding game_time column:', err);
    }
  });
});

module.exports = db; 