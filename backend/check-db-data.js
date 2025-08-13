const { Pool } = require('pg');

const checkAndPopulateData = async () => {
  const connectionString = 'postgresql://dashboard_user:dashboard_pass@localhost:5432/dashboard_db';
  
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Check current data
    const currentData = await client.query('SELECT * FROM sample_data ORDER BY id DESC LIMIT 5');
    console.log('Current sample_data rows:', currentData.rows.length);
    
    if (currentData.rows.length === 0) {
      console.log('📝 No data found, inserting sample data...');
      
      // Insert sample data
      const sampleData = [
        { name: 'API Request 1', value: '150ms', status: 'success' },
        { name: 'API Request 2', value: '200ms', status: 'success' },
        { name: 'API Request 3', value: '300ms', status: 'failed' },
        { name: 'API Request 4', value: '180ms', status: 'success' },
        { name: 'API Request 5', value: '250ms', status: 'pending' },
        { name: 'API Request 6', value: '120ms', status: 'success' },
        { name: 'API Request 7', value: '568ms', status: 'success' },
        { name: 'API Request 8', value: '1000ms', status: 'success' }
      ];
      
      for (const item of sampleData) {
        await client.query(
          'INSERT INTO sample_data (name, value, status) VALUES ($1, $2, $3)',
          [item.name, item.value, item.status]
        );
      }
      
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('📊 Current data:');
      currentData.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.value} (${row.status})`);
      });
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
};

checkAndPopulateData();
