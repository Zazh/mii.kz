const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/crm_database.sqlite');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            status TEXT,
            sawing INTEGER,
            lamination INTEGER,
            cost REAL,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        )
    `);
});

module.exports = db;
