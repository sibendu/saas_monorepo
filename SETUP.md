# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- Terminal/Command line

## Installation & Running

### 1. Install Dependencies
```bash
cd saas-monorepo

# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 2. Set up Environment Variables

**For Web App (apps/web):**
```bash
cd apps/web
cp .env.local.example .env.local
```

Edit `.env.local` and update if needed:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_BFF_URL=http://localhost:3001
BFF_INTERNAL_URL=http://localhost:3001
```

**For BFF (apps/bff):**
```bash
cd apps/bff
cp .env.example .env
```

Edit `.env` if needed (defaults should work):
```env
PORT=3001
NODE_ENV=development
WEB_APP_URL=http://localhost:3000
```

### 3. Run Development Servers

From the root directory:

```bash
# Run both web and bff together
npm run dev
```

Or run them separately in different terminals:

```bash
# Terminal 1 - Web App
npm run dev:web

# Terminal 2 - BFF
npm run dev:bff
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **BFF API**: http://localhost:3001
- **Login credentials**:
    - Email: Use the email you registered with on `/register`
    - Password: Use the password you created during registration

## Testing the Setup

### 1. Test BFF Directly
```bash
# Health check
curl http://localhost:3001/health

# Get customers (requires BFF to be running)
curl http://localhost:3001/api/customers
```

### 2. Test Web App
1. Open http://localhost:3000
2. You'll be redirected to login
3. Enter credentials: admin / password
4. After login, you'll see the customers page
5. Customer data is fetched from the BFF service

## Architecture Flow

```
User Browser
    ↓
Next.js Web App (localhost:3000)
    ├─→ /register - Registration page (name/email/password)
    ├─→ /login - Login page (client component)
    ├─→ /api/auth/[...nextauth] - NextAuth API (embedded)
    │   └─→ Validates user: email/password
    └─→ /customers - Customer list page (server component)
        └─→ Fetches from BFF (localhost:3001/api/customers)
            └─→ Returns customer data
```

## Key Files

### Authentication (Embedded in Web App)
- `apps/web/src/app/api/auth/[...nextauth]/auth-options.ts` - Auth configuration
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler

### Pages
- `apps/web/src/app/login/page.tsx` - Login screen
- `apps/web/src/app/customers/page.tsx` - Customer list (fetches from BFF)

### BFF Routes
- `apps/bff/src/routes/customers.ts` - Customer API endpoint
- `apps/bff/src/index.ts` - Express server setup

### Shared Types
- `packages/shared-types/src/index.ts` - Common TypeScript interfaces

## Common Issues

### Port already in use
If you see "Port 3000 (or 3001) is already in use":
```bash
# Find and kill the process (Mac/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or change the port in .env files
```

### BFF connection error
If the web app can't connect to BFF:
1. Ensure BFF is running: `npm run dev:bff`
2. Check BFF URL in `apps/web/.env.local`
3. Verify BFF health: http://localhost:3001/health

### NextAuth errors
If you see NextAuth errors:
1. Ensure `NEXTAUTH_SECRET` is set in `.env.local`
2. Ensure `NEXTAUTH_URL` matches your web app URL

## Next Steps

### Adding a Database
1. Install Prisma: `npm install prisma @prisma/client --workspace=apps/bff`
2. Initialize: `npx prisma init` in apps/bff
3. Define schema in `prisma/schema.prisma`
4. Update `apps/bff/src/routes/customers.ts` to query database

### Adding More Routes
1. Create new route in `apps/bff/src/routes/`
2. Import and use in `apps/bff/src/index.ts`
3. Add types in `packages/shared-types/src/index.ts`
4. Create pages/components in web app to consume

### Deployment
See README.md for deployment strategy to keep BFF in private network.
