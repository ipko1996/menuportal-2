# Menuportal

Menuportal is a SaaS tool for restaurants to plan weekly menus, generate print‑ready menus, and automatically publish them to social media.

This repository is an Nx monorepo that contains the admin web app, API, and background workers that power Menuportal.

## Features

- **Visual weekly planner**: Drag‑and‑drop calendar for planning menus and special offers by day and service.
- **Dish library**: Re‑use frequently served dishes across weeks instead of rebuilding menus from scratch.
- **Print‑ready PDFs**: Generate clean, branded PDF menus that can be printed or shared with guests.
- **Social media automation**: Schedule posts for Facebook/Instagram so weekly menus are published automatically.
- **Scheduling dashboard**: See which menus are scheduled, already posted, or pending.
- **Restaurant settings**: Configure restaurant details, business hours, prices, notifications, and integrations.
- **Auth & accounts**: Clerk‑based authentication, forgot‑password, OTP flows, and an authenticated app shell.

Most of these flows live in the `admin-client` app and its feature folders (dashboard, dish manager, scheduler, settings, and auth).

## Monorepo structure

- **`apps/admin-client`** – React + Vite admin UI for restaurant owners.
- **`apps/api`** – NestJS API (Fastify) backed by PostgreSQL and `drizzle-orm`.
- **`apps/cron-caller`** – Cloudflare Worker used for scheduled/background jobs (e.g. triggering social publishing).
- **`libs/ui`** – Shared design system and UI components built on Radix UI and Tailwind CSS.
- **`libs/clients`** – API client utilities and shared HTTP configuration.

Nx orchestrates builds, tests, and deployments across these projects.

## Tech stack

- **Frontend**
  - React 19, Vite 6, TypeScript.
  - TanStack Router (file‑based routing) and TanStack Query.
  - Tailwind CSS v4, custom UI library (`@mono-repo/ui`), Radix UI, Lucide/Tabler icons.
  - Clerk for authentication.
- **Backend**
  - NestJS 11 on Fastify.
  - PostgreSQL via `drizzle-orm` and `drizzle-kit` migrations.
  - Docker/Fly.io support for deployment.
- **Infrastructure & tooling**
  - Nx monorepo (`nx`, `@nx/*`).
  - Cloudflare Workers (`wrangler`) for cron/scheduled tasks.
  - ESLint, Prettier, Vitest, TypeScript.

## Getting started

### Prerequisites

- Node.js 20+ (LTS recommended).
- `pnpm` (preferred) or another Node package manager.
- A running PostgreSQL instance.
- A Clerk account with a **publishable key** (for authentication).

### Install dependencies

From the repository root:

```bash
pnpm install
```

## Environment configuration

### Frontend (`apps/admin-client`)

Create an `.env` file in `apps/admin-client` (or use your preferred Vite env setup) and set at least:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_MENUPORTAL_BACKEND_URL=http://localhost:3005
```

The `VITE_CLERK_PUBLISHABLE_KEY` is required; without it, the app will render a helpful setup screen instead of the dashboard.

### Backend (`apps/api`)

The API and database migrations expect a `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgres://user:password@localhost:5432/menuportal
```

Export this variable in your shell or load it via a `.env` file before running API or migration commands.

Additional secrets (e.g. Clerk secret keys, social media API credentials) should also be provided via environment variables as you integrate those services.

## Running the apps locally

### Start the API

From the repository root:

```bash
pnpm nx serve api
```

This uses the `api` project’s `serve` target (NestJS + Fastify). Make sure `DATABASE_URL` is set and your database is reachable.

### Run database migrations

With `DATABASE_URL` configured:

```bash
pnpm nx run api:database:migrate
```

Other database tasks are available:

- `pnpm nx run api:database:generate`
- `pnpm nx run api:database:push`

See `apps/api/project.json` for details.

### Start the admin client

In a separate terminal:

```bash
pnpm nx dev admin-client
```

or:

```bash
pnpm nx serve admin-client
```

This starts the Vite dev server for the admin UI. By default it listens on the port configured in `apps/admin-client/vite.config.mts` (commonly `http://localhost:4200`).

### Optional: cron worker (Cloudflare)

The `apps/cron-caller` app is a Cloudflare Worker used for scheduled tasks:

- Local dev:

  ```bash
  cd apps/cron-caller
  pnpm wrangler dev --local
  ```

- Deploy:

  ```bash
  cd apps/cron-caller
  pnpm wrangler deploy
  ```

Refer to `apps/cron-caller/README.md` for more detailed instructions.

## Nx commands

You can run any task via Nx:

```bash
pnpm nx <target> <project>
```

Examples:

- `pnpm nx dev admin-client`
- `pnpm nx build admin-client`
- `pnpm nx serve api`

Use the Nx project graph to explore dependencies:

```bash
pnpm nx graph
```

## Contributing

Contributions and issues are welcome. If you’re opening a PR, please:

- Keep changes focused and well‑scoped.
- Run linting and tests where applicable:
  - `pnpm nx lint <project>`
  - `pnpm nx test <project>` (where tests exist).

## License

This project is licensed under the **MIT License**.
