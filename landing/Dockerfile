# ================================
# Landing Dockerfile - Multi-stage Build
# ================================
# This Dockerfile builds the Vite React landing page
# and serves it using nginx for optimal production performance.

# Base stage
FROM node:20-alpine AS base

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Increase memory limit if needed
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application (outputs to dist/)
RUN npm run build

# Stage 3: Production with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config for SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3500;
    listen [::]:3500;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback - serve index.html for client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3500
EXPOSE 3500

# nginx runs as non-root by default in alpine image
CMD ["nginx", "-g", "daemon off;"]
