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
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

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
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["/app/start.sh"] 