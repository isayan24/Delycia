 
# Stop and remove old container

docker stop delycia-admin-container
docker rm delycia-admin-container

 
docker rmi delycia-admin

 

# Check logs

````bash
docker logs -f delycia-admin-container

start
docker compose -f docker-compose.yml up -d --build

stop
docker compose -f docker-compose.yml down
````

 ### To Only build
```bash
docker compose up -d --build
```

### To watch In development

```bash
  docker compose watch
```


### This automatically uses `docker-compose.override.yml` to enable hot reloading.
### To stop:

```bash
 docker compose down
```

## If docker doing any issue

```bash
sudo systemctl restart docker
```

## If restarting Docker doesn't help, you can also try pruning stale networks first:

```bash
docker network prune -f
```

## Stop all containers:

```bash
docker kill $(docker ps -q)
```

## Aggressively prune all unused objects (including build cache): Sometimes a corrupted build cache layer holds onto a bad network configuration.

```bash
docker system prune -a -f --volumes
```

## Build with BuildKit disabled (as a fallback):

```bash
DOCKER_BUILDKIT=0 docker compose -f docker-compose.yml up -d --build
```
