# ================================
# Client Dockerfile - Multi-stage Build
# TanStack Start Application
# ================================

# Base stage for shared setup
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for consistency)
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM base AS builder
WORKDIR /app 

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments (These must be passed during docker build)
# Note: We use VITE_ prefix as Vite requires this for client-side variables
ARG VITE_API_BASE_URL
ARG VITE_APP_URL
ARG IMAGEKIT_PUBLIC_KEY
ARG IMAGEKIT_PUBLIC_URL_ENDPOINT

# Set ENVs for the build process (Vite/TanStack Start needs them)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_URL=$VITE_APP_URL
ENV IMAGEKIT_PUBLIC_KEY=$IMAGEKIT_PUBLIC_KEY
ENV IMAGEKIT_PUBLIC_URL_ENDPOINT=$IMAGEKIT_PUBLIC_URL_ENDPOINT
ENV NODE_ENV=production

# Increase memory limit for build (MUI icons + Nitro require more memory)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeuser

# Copy package files for production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
# TanStack Start with Nitro outputs to .output/ directory
COPY --from=builder --chown=nodeuser:nodejs /app/.output ./.output

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 4000

# Start command
CMD ["node", ".output/server/index.mjs"]
