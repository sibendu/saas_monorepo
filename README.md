# SaaS Monorepo - Next.js + BFF Architecture

A production-ready monorepo setup with Next.js frontend and separate Node.js BFF service.

## Structure

```
saas-monorepo/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── bff/          # Node.js BFF service (port 3001)
└── packages/
    └── shared-types/ # Shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install all dependencies
npm install

# Install dependencies for all workspaces
npm install --workspaces
```

### Development

```bash
# Start PostGreSQL Server
C:\Software\PostgreSQL\18\bin\pg_ctl start -D C:\Software\PostgreSQL\18\data

## Prisma commands to sync database schema
npx prisma migrate dev --name add-registration-typ
npx prisma migrate

# Run both web and bff in development mode
npm run dev

# Run individually
npm run dev:web   # Next.js on http://localhost:3000
npm run dev:bff   # BFF on http://localhost:3001
```

### Test

npm run test - this will run all tests other than e2e

To run e2e tests with browser (not headless mode)
npm run -w apps/web test:e2e -- --headed  

### Build

```bash
# Build all apps
npm run build

# Build individually
npm run build:web
npm run build:bff
```

## Architecture

### Web App (apps/web)
- **Framework**: Next.js 14 with App Router
- **Port**: 3000
- **Features**:
  - Login screen with embedded auth API route
  - Customer list screen
  - Session-based authentication using next-auth
  - Embedded API route: `/api/auth/[...nextauth]` (email + password credentials)

### BFF Service (apps/bff)
- **Framework**: Express.js with TypeScript
- **Port**: 3001
- **Features**:
  - `/api/customers` - Returns customer list
  - Trusted by web app via private network (no additional auth layer)
  - Service-to-service communication

### Shared Types (packages/shared-types)
- Common TypeScript interfaces and types
- Used by both web and bff for type safety

## Security Model

- **Embedded routes** (like `/api/auth/login`): Use Next.js built-in session management
- **BFF communication**: Deployed in private network - web app trusts BFF
- **No CORS**: BFF not publicly accessible, only reachable from web app

## Deployment Strategy

1. Deploy web app to Vercel/AWS/GCP
2. Deploy BFF in private VPC/network
3. Configure web app to communicate with BFF via private endpoint
4. Ensure BFF is NOT publicly accessible

## Adding New Features

### Embedded API Route (in web app)
```typescript
// apps/web/app/api/new-route/route.ts
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

### BFF Route
```typescript
// apps/bff/src/routes/new-route.ts
router.get('/api/new-feature', async (req, res) => {
  // Your logic here
  res.json({ data: 'something' });
});
```

## Migration Path

When you need to extract embedded routes to BFF:
1. Copy route logic from `apps/web/app/api/*` to `apps/bff/src/routes/*`
2. Update web app to call BFF endpoint instead
3. Remove old embedded route
4. Types remain shared via `packages/shared-types`
