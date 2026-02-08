# Fresh Build (this will take ~5-6 minutes)

```bash
docker build \
 -t delycia-admin \
 --build-arg VITE_SERVER_URL="https://api.delycia.com/api/v1" \
 --build-arg VITE_WS_SERVER_URL="wss://api.delycia.com/orders" \
 --build-arg VITE_APP_URL="https://admin.delycia.com" \
 --build-arg CRYPTO_SECRET_KEY="iuJhefiiKxerEPPMwjjSUHRTZfumDMmqQAFGVePaNvcRkkgxvz" \
 --build-arg IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 --build-arg IMAGEKIT_PUBLIC_URL_ENDPOINT="https://ik.imagekit.io/phy7j8tcu" \
 .
```

```bash
# Rebuild the image (mandatory for code changes)
docker build -t delycia-admin .
```

# Stop and remove old container

docker stop delycia-admin-container
docker rm delycia-admin-container

# Remove old image

docker rmi delycia-admin

# Run with runtime env vars

```bash
docker run -d \
 -p 4500:4500 \
 --name delycia-admin-container \
 -e SERVER_URL="https://api.delycia.com/api/v1" \
 -e VITE_WS_SERVER_URL="wss://api.delycia.com/orders" \
 -e VITE_APP_URL="https://admin.delycia.com" \
 -e IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 -e IMAGEKIT_PRIVATE_KEY="private_EFMo+gIf3ApkgEqIAJdd0nUUFGo=" \
 -e IMAGEKIT_PUBLIC_URL_ENDPOINT="https://ik.imagekit.io/phy7j8tcu" \
 -e CRYPTO_SECRET_KEY="iuJhefiiKxerEPPMwjjSUHRTZfumDMmqQAFGVePaNvcRkkgxvz" \
 delycia-admin
```

# Check logs

docker logs -f delycia-admin-container

start
docker compose -f docker-compose.yml up -d --build

stop
docker compose -f docker-compose.yml down

remove
docker stop delycia-admin-container && docker rm delycia-admin-container
