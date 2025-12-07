const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '..', 'data', 'topthai.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', DB_PATH);
        initDatabase();
    }
});

// Initialize database schema
function initDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating contacts table:', err.message);
        } else {
            console.log('Contacts table ready');
        }
    });
}

// Insert a new contact
function insertContact(name, email, phone, message) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [name, email, phone, message], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
}

// Get all contacts (for admin purposes if needed)
function getAllContacts() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM contacts ORDER BY created_at DESC`;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Close database connection gracefully
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database connection closed');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    insertContact,
    getAllContacts,
    closeDatabase
};

