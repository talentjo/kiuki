# Mighty Plants

## Docker

```
cp .env.example .env
docker-compose up
```

This will install all depedencies and run dev server with staging api proxy


To enter node bash:

```
docker-compose exec front sh
```


To run dev/build locally (without Node Docker container), you still need working api proxy:
```
docker-compose up api
```