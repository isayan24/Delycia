# Build

```bash
docker build -t delycia-landing .
```

# Stop and remove old container

docker stop delycia-landing-container
docker rm delycia-landing-container

# Remove old image

docker rmi delycia-landing

# Run container

```bash
docker run -d \
 -p 3500:3500 \
 --name delycia-landing-container \
 delycia-landing
```

# Check logs

docker logs -f delycia-landing-container
