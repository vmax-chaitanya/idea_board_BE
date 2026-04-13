# AI-Assisted Idea Board Backend

Production-ready Node.js backend following MVC architecture with Prisma + PostgreSQL.

## Features

- Create idea with AI suggestion generation
- Fetch all ideas with tags and like counts
- Like idea with duplicate prevention by `idea_id + user_agent`
- Tag filtering via query parameter
- Security with Helmet and rate limiting
- Request/error logging with Pino
- Global error handling with standard response format
- Swagger API docs and Postman collection

## Project Structure

```txt
src/
  controllers/
  services/
  repositories/
  routes/
  middlewares/
  utils/
  config/
  validators/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
copy .env.example .env
```

3. Update `DATABASE_URL` in `.env`.

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Start development server:

```bash
npm run dev
```

## API Endpoints

- `POST /ideas`
- `GET /ideas`
- `POST /ideas/:id/like`

Swagger docs: `http://localhost:4000/api-docs`

Postman collection: `postman/AI-Assisted-Idea-Board.postman_collection.json`
