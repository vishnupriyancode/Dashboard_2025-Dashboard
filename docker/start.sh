#!/bin/sh

echo "Starting dashboard application..."

# Create necessary directories if they don't exist
mkdir -p /app/backend/data /app/logs

# Initialize database if it doesn't exist
if [ ! -f /app/backend/data/dashboard.sqlite ]; then
    echo "Initializing database..."
    cd /app/backend
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./data/dashboard.sqlite');
    const fs = require('fs');
    const initSQL = fs.readFileSync('./config/init.sql', 'utf8');
    db.exec(initSQL, (err) => {
        if (err) {
            console.error('Database initialization error:', err);
            process.exit(1);
        }
        console.log('Database initialized successfully');
        db.close();
    });
    "
fi

# Function to handle shutdown
cleanup() {
    echo "Shutting down dashboard application..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Start the backend Node.js application
echo "Starting backend server..."
cd /app/backend
node index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "Backend is running with PID: $BACKEND_PID"

# Start the frontend (serve the built React app)
echo "Starting frontend server..."
cd /app/frontend
serve -s build -l 3000 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "ERROR: Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "Frontend is running with PID: $FRONTEND_PID"
echo "Dashboard application is now running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
