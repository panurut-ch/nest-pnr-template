This is a [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

This project is a Nestjs backend service template

## Database
- PostgreSQL

## Library
- Nest.js
- Passport.js
- Bcrypt.js
- Swagger
- Jest
- Prisma
- class-validator
- Redis

## How to run local
```bash
npm install
```
```bash
npm run start:dev
```
API will live on
```bash
http://localhost:3001/
```
url : http://localhost:3001/

## How to run with Docker
```bash
docker-compose build --no-cache
```
```bash
docker-compose up -d
```
API will live on
```bash
http://localhost:3000/
```
url : http://localhost:3000/

## API Document
```bash
http://localhost:3000/api/
```
url : http://localhost:3000/api/

## Unit Test
test auth service
```bash
npm run test:auth
```

## Caching with Redis  
Caching data for API `/api/v1/products/filter` : list products data  

## User & Password for test
email: panurut@panurut.dev  
password: password-panurut

email: hello@base.com  
password: password-base
