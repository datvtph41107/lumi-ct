# Docker build & run

## Structure
- Root compose file brings up:
  - MySQL (prod/dev)
  - Server (NestJS)
  - Client (Vite static via nginx)

## Commands

- Build images
```
docker compose build
```

- Start stack
```
docker compose up -d
```

- Logs
```
docker compose logs -f server client
```

- Stop
```
docker compose down
```

## Environment
- Server env: `PORT=3000`, `PREFIX=/api`, `CLIENT_URL=http://localhost:5173` (override via compose)
- Client env: Vite default serves on 5173 for dev; for prod we build and serve via nginx container.