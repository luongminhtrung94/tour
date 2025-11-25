# Multi-stage build for smaller image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY --chown=node:node package*.json ./
COPY --chown=node:node server ./server
COPY --chown=node:node frontend ./frontend

# Switch to non-root user for security
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/index.js"]

