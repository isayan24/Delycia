# Client Docker Commands

## Fresh Build (this will take ~5-6 minutes)

```bash
docker build \
 -t delycia-client \
 --build-arg VITE_API_BASE_URL="https://api.delycia.com/api/v1" \
 --build-arg IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 --build-arg IMAGEKIT_PUBLIC_URL_ENDPOINT="https://ik.imagekit.io/phy7j8tcu" \
 --build-arg NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 .
```

## Rebuild the image (mandatory for code changes)

```bash
docker build -t delycia-client .
```

## Stop and remove old container

```bash
docker stop delycia-client-container
docker rm delycia-client-container
```

## Remove old image

```bash
docker rmi delycia-client
```

## Run with runtime env vars

```bash
docker run -d \
 -p 4000:4000 \
 --name delycia-client-container \
 -e VITE_API_BASE_URL="https://api.delycia.com/api/v1" \
 -e IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 -e IMAGEKIT_PRIVATE_KEY="private_EFMo+gIf3ApkgEqIAJdd0nUUFGo=" \
 -e IMAGEKIT_PUBLIC_URL_ENDPOINT="https://ik.imagekit.io/phy7j8tcu" \
 -e NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_RP9txkdrkYPegKnmek1Trihi3u0=" \
 -e RESEND_API_KEY="re_JTdZNMik_7mE3phmoHwjU5x51oKT5uq3D" \
 -e GOOGLE_CLIENT_ID="164181836949-v588bmqlqi77cfbbne6cdg38k4jp7m7j.apps.googleusercontent.com" \
 -e GOOGLE_CLIENT_SECRET="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=adjafhweuyrwjk_09wehlkasdahsfblkjas" \
 delycia-client
```

## Check logs

```bash
docker logs -f delycia-client-container
```
