<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Short My URL

## Tecnologias utilizadas
 - NestJS – Framework principal para estruturação da aplicação.
 - TypeORM – ORM para integração com banco de dados PostgreSQL utitlizando NeonDB.
 - Swagger (OpenAPI) – Documentação interativa da API em /api.
 - JWT – Autenticação segura baseada em token.
 - Docker & Docker Compose – Containerização e facilidade de deploy.
 - Interceptors e Middlewares – Para logs.

## Funcionalidades

- Registro e login de usuários
- Autenticação via JWT
- Encurtar URLs (com ou sem autenticação)
- Listar URLs encurtadas pelo usuário autenticado
- Atualizar URLs encurtadas
- Soft delete de URLs
- Redirecionamento por código curto
- Contador de cliques por link
- Documentação Swagger integrada
- Deploy com Docker + Docker Compose

## Prod

### Link de Prod
https://short-my-url-production.up.railway.app/

### Doc de Prod
https://short-my-url-production.up.railway.app/api

## Rodar Local - Docker
```bash
$ docker compose up
```
## Rodar Local

### Project setup

```bash
$ npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo para rodar local:

```env
DATABASE_URL='postgresql://smu_owner:npg_4BnUCgmS5zRs@ep-sparkling-darkness-acbx0mel-pooler.sa-east-1.aws.neon.tech/smu?sslmode=require&channel_binding=require'
JWT_SECRET=default_secret_key
PORT=3000
NODE_ENV=production
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Auth

| Método | Rota           | Descrição                   |
|--------|----------------|-----------------------------|
| POST   | `/auth/register` | Registra um novo usuário     |
| POST   | `/auth/login`    | Faz login e retorna um JWT  |

### Short URLs

| Método | Rota              | Descrição                                           |
|--------|-------------------|-----------------------------------------------------|
| POST   | `/shorten`        | Encurtar uma URL (com ou sem login)                |
| GET    | `/my-urls`        | Listar URLs do usuário autenticado                 |
| PATCH  | `/:id`            | Atualizar URL original (com auth)                  |
| DELETE | `/:id`            | Excluir URL (soft delete, com auth)                |
| GET    | `/:shortCode`     | Redirecionar para a URL original                   |