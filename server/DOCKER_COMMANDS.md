# Docker Commands for Delycia Server

Here are the essential commands to manage your Docker container. Run these commands from the `server/` directory.

## 🔨 Build

Build the Docker image from the Dockerfile.

```bash
docker build -t delycia-server .
```

## 🚀 Run (Start New)

Start a new container in the background (`-d`), mapping port 8020 (`-p`), using the `.env` file, and naming it `delycia-server-instance`.

```bash
docker run -d -p 8020:8020 --env-file .env --name delycia-server-instance delycia-server
```

## 🛑 Stop

Stop the running container.

```bash
docker stop delycia-server-instance
```

## ▶️ Start (Resume)

Start the container again if it was just stopped (not removed).

```bash
docker start delycia-server-instance
```

## 📜 Logs

View the logs of the running container.

```bash
# View logs once
docker logs delycia-server-instance

# Follow logs properties (live stream)
docker logs -f delycia-server-instance
```

## 🗑️ Remove

Remove the container layout (necessary if you want to run `docker run` again with the same name).

```bash
# Stop and remove in one go
docker rm -f delycia-server-instance
```

## 💻 Shell Access

Enter the running container's shell for debugging.

```bash
docker exec -it delycia-server-instance /bin/sh
```
