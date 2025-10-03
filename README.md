This repository hosts the **AI 学习搭子** platform, combining a Next.js 15 frontend with a NestJS backend that powers authentication and future learning services.

## Development Scripts

```bash
# Frontend: runs the Next.js dev server with Turbopack
pnpm dev

# Backend: starts the NestJS API with ts-node
pnpm server:dev

# Build backend output to dist/server
pnpm server:build

# Start backend from compiled output
pnpm server:start
```

The frontend is available at [http://localhost:3000](http://localhost:3000). By default the backend listens on [http://localhost:4000](http://localhost:4000) and exposes its REST API under `/api`.

## Environment Configuration

The backend reads configuration exclusively from environment variables. Set these before launching `pnpm server:dev` or the compiled server:

| Variable | Default (non-production) | Description |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port for the NestJS server |
| `JWT_SECRET` | `local-development-secret` | Symmetric secret used to sign access tokens |
| `JWT_EXPIRES_IN` | `1h` | JWT expiration window expressed in [zeit/ms](https://github.com/vercel/ms) compatible format |

In production builds `JWT_SECRET` and `JWT_EXPIRES_IN` are required — the process will exit early if either value is missing.

## Code Quality

Run Ultracite (Biome) to validate formatting and linting across the monorepo:

```bash
pnpm ultracite check
```

## Project Structure

```
apps/
  server/              NestJS backend (authentication, future services)
docs/                  Architecture, requirements, and planning assets
src/                   Next.js application
```

The NestJS backend currently provides registration, login, and profile retrieval endpoints with JWT-based authentication. The in-memory `UsersService` is a placeholder until database layers are integrated.
