# Docker Deployment Guide

This guide explains how to run the Delycia application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

## Quick Start

### Option 1: Full-Stack (Server + Client + Admin)

Run all services with a single command:

```bash
# 1. Copy the environment template
cp .env.docker.example .env.docker

# 2. Edit with your configuration
nano .env.docker  # or use your preferred editor

# 3. Build and run all services
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

**Access Points:**
| Service | URL |
|---------|-----|
| Server API | http://localhost:8020 |
| Client App | http://localhost:4000 |
| Admin Panel | http://localhost:4500 |

### Option 2: Server Only

Run only the backend API server:

```bash
# 1. Copy and configure environment (if not done)
cp .env.docker.example .env.docker
nano .env.docker

# 2. Build and run server only
docker compose -f docker-compose.server.yml up --build

# Or in detached mode
docker compose -f docker-compose.server.yml up -d --build
```

---

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f client
docker compose logs -f admin
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Server only
docker compose -f docker-compose.server.yml down
```

### Rebuild Specific Service

```bash
# Rebuild and restart a specific service
docker compose up -d --build server
docker compose up -d --build client
docker compose up -d --build admin
```

### View Running Containers

```bash
docker compose ps
```

### Enter Container Shell

```bash
docker compose exec server sh
docker compose exec client sh
docker compose exec admin sh
```

---

## Environment Variables

All environment variables are configured in `.env.docker`. Key variables:

### Database

| Variable  | Description              |
| --------- | ------------------------ |
| `DB_HOST` | Database server hostname |
| `DB_USER` | Database username        |
| `DB_NAME` | Database name            |
| `DB_PASS` | Database password        |

### Ports (Optional)

| Variable      | Default | Description               |
| ------------- | ------- | ------------------------- |
| `SERVER_PORT` | 8020    | Host port for API server  |
| `CLIENT_PORT` | 4000    | Host port for client app  |
| `ADMIN_PORT`  | 4500    | Host port for admin panel |

### API URLs

| Variable            | Description                                   |
| ------------------- | --------------------------------------------- |
| `VITE_API_BASE_URL` | API URL for client (uses Docker service name) |
| `ADMIN_SERVER_URL`  | API URL for admin (uses Docker service name)  |
| `WS_SERVER_URL`     | WebSocket URL for real-time features          |

> **Note:** For internal Docker communication, use service names (e.g., `http://server:8020`).
> For external/production access, use your public domain.

---

## Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (Nginx, Traefik, Caddy) for:
   - SSL/TLS termination
   - Load balancing
   - Domain routing

2. **External database** - Use a managed database service instead of containerized DB

3. **Environment secrets** - Use Docker secrets or environment management tools

4. **Custom ports** - Modify port mappings in `.env.docker`

### Example with Nginx Reverse Proxy

```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./certs:/etc/nginx/certs:ro
  depends_on:
    - server
    - client
    - admin
  networks:
    - delycia-network
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker compose logs server

# Verify environment variables
docker compose config
```

### Port already in use

```bash
# Change port in .env.docker
SERVER_PORT=8021  # Different port
```

### Build cache issues

```bash
# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Health check failing

```bash
# Check if the service is responding
docker compose exec server wget -q -O- http://localhost:8020/api/v1/health
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Server    │  │   Client    │  │    Admin    │     │
│  │  (API)      │  │  (Frontend) │  │  (Dashboard)│     │
│  │  :8020      │  │  :4000      │  │  :4500      │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  External   │
                    │  Database   │
                    └─────────────┘
```

---

## File Structure

```
Delycia/
├── docker-compose.yml           # Full-stack compose
├── docker-compose.server.yml    # Server-only compose
├── .env.docker.example          # Environment template
├── .env.docker                   # Your configuration (gitignored)
├── DOCKER.md                    # This file
├── server/
│   └── Dockerfile
├── client/
│   └── Dockerfile
└── admin/
    └── Dockerfile
```
