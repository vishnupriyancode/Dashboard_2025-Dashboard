const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration - use environment variable or fallback to local development
const connectionString = process.env.DATABASE_URL || 
'postgresql://dashboard_user:dashboard_pass@localhost:5432/dashboard_db';

const pool = new Pool({
  connectionString: connectionString,
});

console.log('Connecting to PostgreSQL database...');

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create sample_data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT
      )
    `);
    console.log('sample_data table created or already exists');

    // Create api_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id SERIAL PRIMARY KEY,
        domain_id TEXT,
        model TEXT,
        method TEXT,
        status TEXT,
        endpoint TEXT,
        time TIMESTAMP,
        value TEXT,
        request_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('api_logs table created or already exists');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('users table created or already exists');

    // Check if default user exists
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userCount.rows[0].count === '0') {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      // Insert default user with hashed password
      await pool.query(`
        INSERT INTO users (username, password, email) 
        VALUES ($1, $2, $3)
      `, ['admin', hashedPassword, 'admin@example.com']);
      console.log('Default user created: admin / admin123');
    }

    console.log('Database initialization completed');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);

module.exports = {
  query: async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  },
  
  // Add a method to get the pool for transactions
  getPool: () => pool
}; 