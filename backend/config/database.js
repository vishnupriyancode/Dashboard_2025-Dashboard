const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/dashboard.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating sample_data table:', err);
        process.exit(1);
      }
      console.log('sample_data table created or already exists');
    });

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        process.exit(1);
      }
      console.log('users table created or already exists');
      
      // Insert default user if table is empty
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
          console.error('Error checking users count:', err);
        } else if (row.count === 0) {
          // Insert default user
          db.run(`
            INSERT INTO users (username, password, email) 
            VALUES (?, ?, ?)
          `, ['admin@example.com', 'admin123', 'admin@example.com'], (err) => {
            if (err) {
              console.error('Error inserting default user:', err);
            } else {
              console.log('Default user created: admin@example.com / admin123');
            }
          });
        }
      });
    });
  }
});

module.exports = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      console.log('Executing query:', sql);
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          console.log('Query successful, rows:', rows);
          resolve(rows);
        }
      });
    });
  }
}; 