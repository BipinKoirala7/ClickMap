# ClickMap

ClickMap is a bit.ly-style URL shortener project built as a full-stack monorepo. The current codebase is organized around a lightweight API for creating and managing shortened links, with a frontend scaffold for the user experience and dashboards that will support analytics, caching, and background processing.

The product direction is focused on fast link resolution, reliable link creation, and growth-oriented features such as click analytics, cache-backed lookups, and worker-driven jobs for tasks that should run outside the request cycle.

## Project Structure

- `Backend/` - Express-based API and database layer
- `frontend/` - React Router application for the web UI

## Backend Tech Stack

- Node.js with TypeScript
- Express 5 for HTTP routing and middleware
- PostgreSQL as the main database
- Drizzle ORM for typed database access
- Zod for runtime validation and schema parsing
- dotenv for environment configuration
- bcryptjs for password hashing
- jsonwebtoken for authentication tokens
- CORS, Helmet, and Morgan for API hardening and logging
- nanoid for generating short, unique identifiers
- Supabase client support for external integrations where needed

### Backend Focus

The backend is being shaped around a link management domain. Current modules already show the foundation for creating short links, storing link metadata, and validating payloads. The wider plan is to support:

- cache-first link resolution for speed
- BullMQ-powered workers for asynchronous tasks
- analytics collection for clicks, referrers, and usage trends
- scalable processing for jobs that should not block API requests

## Frontend Tech Stack

- React 19 with TypeScript
- React Router 7 for routing, SSR, and server-driven app structure
- Vite for fast local development and builds
- Tailwind CSS 4 for styling
- React Query for server-state management
- React Hook Form and Zod for form handling and validation
- Recharts for analytics dashboards and charts
- Base UI and shadcn-style primitives for UI components
- Axios for API communication
- Inter font family for the current visual foundation

### Frontend Focus

The frontend is currently a starter scaffold, but it is set up for the kind of product ClickMap needs: a dashboard-style interface, link creation flows, analytics views, and operational screens for managing links and performance data.

## What ClickMap Is Aiming To Be

ClickMap is intended to become more than a basic short-link service. The long-term direction includes:

- fast redirects with intelligent caching
- background workers for link events and cleanup jobs
- analytics for clicks, devices, locations, and referrers
- link management and user-facing dashboards
- room for future growth features such as custom codes, expiry rules, and campaign insights

## Development Status

This project is still in development. The current repository contains the core foundation and early scaffolding, but many of the production features are still being built out.
