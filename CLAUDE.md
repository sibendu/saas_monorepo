# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an npm workspace monorepo with:
- **apps/web** - Next.js 14+ frontend (port 3000) with App Router
- **apps/bff** - Express.js backend-for-frontend service (port 3001)
- **packages/shared-types** - Shared TypeScript types used by both apps

## Development Commands

```bash
# Start both web and bff concurrently
npm run dev

# Start individually
npm run dev:web   # Next.js on http://localhost:3000
npm run dev:bff   # Express BFF on http://localhost:3001

# Run tests (excludes e2e)
npm run test

# Run e2e tests (with browser UI)
npm run -w apps/web test:e2e -- --headed

# Run specific test suites
npm run test:unit          # All unit tests
npm run test:integration   # All integration tests

# Type checking
npm run type-check

# Build
npm run build
npm run build:web
npm run build:bff
```

## Database Setup (PostgreSQL + Prisma)

The database schema is located at `apps/web/prisma/schema.prisma`.

```bash
# Start PostgreSQL (Windows-specific path from README)
C:\Software\PostgreSQL\18\bin\pg_ctl start -D C:\Software\PostgreSQL\18\data

# Set DATABASE_URL environment variable
set DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# Apply migrations from repo root
npm exec --workspace=apps/web prisma migrate deploy --schema prisma/schema.prisma

# Create new migration
npx prisma migrate dev --name migration_name

# Regenerate Prisma client after schema changes
npm exec --workspace=apps/web prisma generate --schema prisma/schema.prisma
```

## Architecture

### Authentication Flow
- Uses **NextAuth** with JWT session strategy (30-day expiry)
- Supports credentials (email/password), Google OAuth, and GitHub OAuth
- Auth configuration: `apps/web/src/app/api/auth/[...nextauth]/auth-options.ts`
- Prisma Customer model tracks `registrationType` (DIRECT, GOOGLE, GITHUB)
- Social logins require registration intent via cookie before account creation
- Password reset flow uses token-based verification with expiration

### Web App (Next.js)
- **Framework**: Next.js 14+ with App Router
- **Path alias**: `@/` maps to `apps/web/src/`
- **Pages**: Login, Register, Dashboard, Customers, Tasks, Preferences, Password Reset
- **Embedded API Routes** (session-protected):
  - `/api/auth/[...nextauth]` - NextAuth endpoints
  - `/api/register` - User registration
  - `/api/preferences` - User preferences update
  - `/api/auth/forgot-password` - Password reset request
  - `/api/auth/reset-password` - Password reset confirmation
  - `/api/auth/social-register-intent` - OAuth registration flow
  - `/api/tasks/[taskId]` - Task operations (proxies to BFF)
- **Authentication**: All protected pages check session via `getServerSession(authOptions)`

### BFF Service (Express)
- **Port**: 3001
- **Routes**:
  - `GET /health` - Health check endpoint
  - `GET /api/customers` - Returns customer list
  - `GET /api/customers/:id` - Returns single customer
  - `GET /api/dashboard` - Requires POST with user data, returns personalized dashboard
  - `GET /api/tasks` - Returns task list
  - `PUT /api/tasks/:taskId` - Updates task
  - `DELETE /api/tasks/:taskId` - Deletes task
- **Security**: CORS restricted to web app origin (configurable via WEB_APP_URL env var)
- **Middleware**: Helmet for security headers, Morgan for logging

### Shared Types Package
- Located at `packages/shared-types`
- Exports TypeScript interfaces: User, Customer, Task, Dashboard data structures, API responses
- Must be built (`npm run build`) before use, or auto-transpiled by Next.js config

## Testing Architecture

### Test Organization
Tests are organized under `src/tests/` in both apps:
- **Unit tests**: `src/tests/unit/*.unit.test.tsx` or inline `*.unit.test.ts`
- **Integration tests**: `src/tests/integration/*.integration.test.ts` or inline `*.integration.test.tsx`
- **E2E tests** (web only): `src/tests/e2e/*.spec.ts`

### Test Configuration
- **Vitest**: Unit and integration tests use jsdom environment
- **Playwright**: E2E tests run against development server (auto-started)
- **MSW**: Mock Service Worker setup at `apps/web/src/tests/msw/` for API mocking
- Test reports saved to `./reports/` (junit.xml, results.json, coverage/)

### Running Specific Tests
```bash
# In web workspace
npm run -w apps/web test:unit
npm run -w apps/web test:integration
npm run -w apps/web test:e2e

# In bff workspace
npm run -w apps/bff test:unit
npm run -w apps/bff test:integration
```

## Database Schema (Prisma)

Key models in `apps/web/prisma/schema.prisma`:
- **Customer**: id, email (mapped from username field), password, name, company, registrationType, passwordResetToken, passwordResetExpiresAt
- **Task**: id, taskId (unique), title, project, priority (Low/Medium/High/Critical), date, owner

## Adding New Features

### Adding an Embedded API Route (in web app)
```typescript
// apps/web/src/app/api/new-route/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Your logic here
}
```

### Adding a BFF Route
```typescript
// apps/bff/src/routes/new-feature.ts
import { Router } from 'express';
const router = Router();

router.get('/api/new-feature', async (req, res) => {
  // Your logic here
  res.json({ data: 'something' });
});

export default router;

// Register in apps/bff/src/index.ts
import newFeatureRouter from './routes/new-feature';
app.use('/api', newFeatureRouter);
```

### Adding Shared Types
```typescript
// packages/shared-types/src/index.ts
export interface NewType {
  // your fields
}

// Then rebuild: npm run build --workspace=packages/shared-types
```

## Key Conventions

- All TypeScript files use strict mode
- Import shared types from `@saas/shared-types`
- Use `@/` prefix for imports within web app (e.g., `@/lib/prisma`)
- Database queries use Prisma client initialized at `apps/web/src/lib/prisma.ts`
- BFF responses follow `ApiResponse<T>` wrapper type for consistency
