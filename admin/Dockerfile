# ================================
# Admin Dockerfile - Multi-stage Build
# TanStack Start Application
# ================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ================================
# Stage 2: Build
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables (injected at build time)
ARG SERVER_URL
ARG WS_SERVER_URL
ARG CRYPTO_SECRET_KEY

ENV SERVER_URL=${SERVER_URL}
ENV WS_SERVER_URL=${WS_SERVER_URL}
ENV CRYPTO_SECRET_KEY=${CRYPTO_SECRET_KEY}

# Build the application
RUN pnpm build

# ================================
# Stage 3: Production
# ================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodeuser

# Install pnpm for runtime
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built application and dependencies
COPY --from=builder --chown=nodeuser:nodejs /app/.output ./.output
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=4500
ENV HOST=0.0.0.0

# Expose port
EXPOSE 4500

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4500/ || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
