# app

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build

## docker

### build

    docker build --rm --no-cache -t donft_frontend:latest .

### run

    docker run --rm  -p 8080:80  --name donft_frontend donft_frontend:latest