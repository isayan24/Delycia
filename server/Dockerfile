# ================================
# Backend Dockerfile (SAFE PROD)
# ================================

FROM node:20-alpine

WORKDIR /app

# Native build deps
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install deps
RUN npm ci

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production

# Dokploy will inject PORT
EXPOSE 8020

# Start app
CMD ["node", "src/index.js"]
