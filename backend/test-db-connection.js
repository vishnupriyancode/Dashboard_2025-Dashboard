const { Pool } = require('pg');

// Test database connection
const testConnection = async () => {
  const connectionString = 'postgresql://dashboard_user:dashboard_pass@localhost:5432/dashboard_db';
  
  console.log('Testing connection to:', connectionString);
  
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0]);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Available tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check sample_data table
    if (tablesResult.rows.some(row => row.table_name === 'sample_data')) {
      const sampleDataResult = await client.query('SELECT COUNT(*) as count FROM sample_data');
      console.log('✅ sample_data table has', sampleDataResult.rows[0].count, 'rows');
    } else {
      console.log('❌ sample_data table does not exist');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 PostgreSQL service might not be running');
    } else if (err.code === '28P01') {
      console.log('💡 Authentication failed - check username/password');
    } else if (err.code === '3D000') {
      console.log('💡 Database "dashboard_db" does not exist');
    }
  } finally {
    await pool.end();
  }
};

testConnection();
