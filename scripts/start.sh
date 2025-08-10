#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

# Function to check PostgreSQL connection
check_postgres() {
  cd /app/backend && node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  queryTimeoutMillis: 5000
});

client.connect()
  .then(() => {
    console.log('PostgreSQL is ready');
    client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.log('PostgreSQL is not ready yet. Error:', err.message);
    process.exit(1);
  });
" 2>/dev/null
}

# Wait for PostgreSQL with timeout
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
  if check_postgres; then
    break
  fi
  echo "Waiting for PostgreSQL... ($counter/$timeout)"
  sleep 2
  counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
  echo "Timeout waiting for PostgreSQL. Starting anyway..."
fi

echo "PostgreSQL is ready!"

# Start the Node.js application
echo "Starting dashboard application..."
cd /app/backend && exec node index.js 