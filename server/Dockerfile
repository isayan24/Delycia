# ================================
# Server Dockerfile - Multi-stage Build
# ================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for potential build needs)
RUN npm ci --only=production

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install tini for signal handling
RUN apk add --no-cache tini

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodeuser

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodeuser:nodejs . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8020

# Expose port
EXPOSE 8020

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8020/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start the server using tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
