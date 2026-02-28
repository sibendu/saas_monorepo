# Architecture Documentation

## System Architecture

### Overview
This is a monorepo-based SaaS platform using:
- **Frontend**: Next.js 14 with App Router (TypeScript)
- **BFF**: Express.js (TypeScript)
- **Shared Types**: Common TypeScript package

### Directory Structure
```
saas-monorepo/
├── apps/
│   ├── web/                      # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/              # App router pages
│   │   │   │   ├── api/          # Embedded API routes
│   │   │   │   │   └── auth/     # NextAuth authentication
│   │   │   │   ├── login/        # Login page
│   │   │   │   ├── customers/    # Customer list page
│   │   │   │   └── layout.tsx    # Root layout
│   │   │   └── components/       # React components
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── bff/                      # Backend-for-Frontend service
│       ├── src/
│       │   ├── index.ts          # Express server
│       │   └── routes/           # API routes
│       │       └── customers.ts  # Customer endpoints
│       └── package.json
│
└── packages/
    └── shared-types/             # Shared TypeScript types
        └── src/
            └── index.ts          # Common interfaces
```

## Authentication Flow

### Embedded Authentication (Current Implementation)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Navigate to /login
       ↓
┌─────────────────────────────────────┐
│    Next.js Web App (Port 3000)      │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │   Login Page Component     │   │
│  │  (Client Component)        │   │
│  └────────┬───────────────────┘   │
│           │ 2. Submit credentials  │
│           ↓                         │
│  ┌────────────────────────────┐   │
│  │  /api/auth/[...nextauth]   │   │
│  │  (Embedded API Route)      │   │
│  │                            │   │
│  │  • NextAuth handler        │   │
│  │  • Checks: admin/password  │   │
│  │  • Creates JWT session     │   │
│  └────────┬───────────────────┘   │
│           │ 3. Session created     │
│           ↓                         │
│  ┌────────────────────────────┐   │
│  │   Session Cookie Set       │   │
│  └────────────────────────────┘   │
└─────────────────────────────────────┘
       │ 4. Redirect to /customers
       ↓
    SUCCESS
```

**Security Features:**
- Server-side session validation
- JWT tokens stored in httpOnly cookies
- CSRF protection via NextAuth
- Secure session storage
- No credentials exposed to client

## Data Flow: Customer List

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Navigate to /customers
       ↓
┌─────────────────────────────────────────────────┐
│         Next.js Web App (Port 3000)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │   /customers Page (Server Component)     │  │
│  │                                          │  │
│  │  1. Check session with getServerSession │  │
│  │  2. If no session → redirect to /login  │  │
│  │  3. If session exists:                  │  │
│  └──────────────┬───────────────────────────┘  │
│                 │ 2. Fetch customers            │
│                 ↓                                │
│  ┌──────────────────────────────────────────┐  │
│  │   Server-side fetch to BFF              │  │
│  │   fetch(`${BFF_URL}/api/customers`)     │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │ 3. HTTP request (private network)
                  ↓
┌─────────────────────────────────────────────────┐
│          BFF Service (Port 3001)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │   /api/customers Route                   │  │
│  │                                          │  │
│  │  • No auth check (trusts web app)       │  │
│  │  • Returns customer data                │  │
│  │  • Uses shared Customer type            │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │ 4. JSON response
                  ↓
┌─────────────────────────────────────────────────┐
│         Next.js Web App (Port 3000)             │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │   CustomersList Component                │  │
│  │   (Client Component)                     │  │
│  │                                          │  │
│  │  • Renders table with customer data     │  │
│  │  • Status badges, formatting            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
       │ 5. Rendered HTML
       ↓
┌─────────────┐
│   Browser   │
└─────────────┘
```

## Type Safety Flow

```
┌──────────────────────────────────────┐
│   packages/shared-types/src/index.ts │
│                                      │
│   • Customer interface               │
│   • User interface                   │
│   • API response types               │
└────────┬────────────────┬────────────┘
         │                │
         │                │
    ┌────▼─────┐    ┌────▼─────┐
    │ BFF      │    │ Web App  │
    │          │    │          │
    │ Uses     │    │ Uses     │
    │ Customer │    │ Customer │
    │ type for │    │ type for │
    │ API      │    │ display  │
    │ response │    │          │
    └──────────┘    └──────────┘
```

**Benefits:**
- Single source of truth for types
- Compile-time type checking across services
- Auto-completion in both apps
- Refactoring safety

## Security Model

### Embedded Routes (NextAuth)
```
✅ Server-side validation
✅ Session management
✅ CSRF protection
✅ httpOnly cookies
✅ No token exposure
```

### BFF Communication
```
Current (Development):
  Web → BFF: Direct HTTP (localhost)
  
Production (Recommended):
  Web → BFF: Private VPC/Network
  
  ┌───────────────┐
  │   Internet    │
  └───────┬───────┘
          │ HTTPS
          ↓
  ┌───────────────────┐
  │   Next.js (Web)   │  Public subnet
  └────────┬──────────┘
           │ HTTP (private)
           ↓
  ┌───────────────────┐
  │   BFF Service     │  Private subnet
  └───────────────────┘  (not publicly accessible)
           │
           ↓
  ┌───────────────────┐
  │   Database        │  Private subnet
  └───────────────────┘
```

**Security Principles:**
1. BFF never exposed to internet
2. Only web app can reach BFF
3. Service-to-service trust (no extra auth layer)
4. User authentication handled by NextAuth in web app
5. User context passed in headers if needed

## Scaling Strategy

### Current: Embedded BFF Pattern
```
Next.js App = Frontend + Auth API + BFF Client
                               ↓
                         BFF Service
```

### Future: Extract to Separate Services
When needed, you can extract embedded routes:

```
Frontend (Next.js)
    ↓
API Gateway / BFF
    ├─→ Auth Service
    ├─→ Customer Service
    ├─→ Billing Service
    └─→ Analytics Service
```

**Migration Path:**
1. Code already structured for extraction
2. Move embedded route logic to BFF
3. Update frontend to call BFF
4. Types remain shared
5. No frontend component changes needed

## Environment Configuration

### Development
- Web: localhost:3000
- BFF: localhost:3001
- Direct communication

### Production
- Web: Public URL (e.g., app.yourcompany.com)
- BFF: Private URL (e.g., bff.internal:3001)
- VPC/private network communication

## Deployment Checklist

- [ ] Set NEXTAUTH_SECRET to strong random value
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Configure BFF_INTERNAL_URL to private endpoint
- [ ] Ensure BFF has no public IP/domain
- [ ] Set up VPC peering between web and BFF
- [ ] Configure network security groups
- [ ] Add proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Add database connection
- [ ] Configure Redis for sessions (optional)
