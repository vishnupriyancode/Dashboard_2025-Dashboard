# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install build dependencies for native modules and additional tools
RUN apk add --no-cache python3 make g++ sqlite-dev git

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Install serve globally for frontend
RUN npm install -g serve

# Copy source code
WORKDIR /app
COPY . .

# Rebuild sqlite3 for Alpine Linux
RUN cd backend && npm rebuild sqlite3

# Build frontend with production optimizations
WORKDIR /app/frontend
RUN npm run build

# Set working directory back to app root
WORKDIR /app

# Create necessary directories and set permissions
RUN mkdir -p backend/data logs && \
    chmod -R 755 backend/data logs

# Copy startup script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports for both frontend and backend
EXPOSE 3000 5001

# Start the application
CMD ["/app/start.sh"] 