# Admin Client

A modern admin dashboard built with React, TanStack Router, Clerk authentication, and Shadcn UI, designed for menu management and scheduling in a restaurant context.

## Features

- **Authentication**: Secure login and user management via Clerk.
- **Dashboard**: Overview of menu, tasks, and scheduling.
- **Sidebar Navigation**: Team switcher, user profile, and collapsible navigation groups.
- **Theme Support**: Light/dark mode toggle.
- **Search**: Contextual search across dashboard features.
- **Task & Dish Management**: CRUD operations for menu items and tasks.
- **Error Handling**: Custom error pages and toast notifications.
- **Responsive Layout**: Sidebar, header, and main content adapt to screen size.

## Tech Stack

- **React** (with SWC)
- **TanStack Router**
- **TanStack Query**
- **Clerk** (authentication)
- **Shadcn UI**
- **Vite** (build tool)
- **Tailwind CSS**
- **Nx Monorepo**

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- pnpm (or npm/yarn)

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm nx run admin-client:serve
```

### Build for production

```bash
pnpm nx run admin-client:build
```

## Project Structure

- `src/` — Main source code
  - `components/layout/` — Sidebar, header, navigation
  - `features/` — Dashboard, auth, tasks, menu, etc.
  - `context/` — Theme, font, search providers
  - `stores/` — State management (auth, etc.)
  - `routes/` — Route definitions
  - `utils/` — Helper functions

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `VITE_API_BASE_URL` — Backend API base URL

## License

MIT
