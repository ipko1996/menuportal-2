# MenuPortal Monorepo

A modern monorepo for restaurant menu management, scheduling, and admin operations. Built with Nx, React, Vite, Clerk authentication, Shadcn UI, and more.

## Apps

- **admin-client**: Admin dashboard for managing menus, tasks, and schedules.
- **api**: Backend API for menu, dish, schedule, and authentication.
- **cron-caller**: Scheduled task runner.

## Libraries

- **ui**: Shared UI components (Shadcn UI, custom elements).
- **clients**: API clients and utilities.

## Features

- Modular Nx workspace
- React + Vite frontend
- Clerk authentication
- Shadcn UI components
- Tailwind CSS styling
- TanStack Router & Query
- Robust error handling
- Responsive layouts

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- pnpm (or npm/yarn)

### Install dependencies

```bash
pnpm install
```

### Start the admin dashboard

```bash
pnpm nx run admin-client:serve
```

### Start the API server

```bash
pnpm nx run api:serve
```

### Build all projects

```bash
pnpm nx run-many --target=build --all
```

## Project Structure

- `apps/` — Application projects (admin-client, api, cron-caller)
- `libs/` — Shared libraries (ui, clients)

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `VITE_API_BASE_URL` — Backend API base URL

## License

MIT

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
