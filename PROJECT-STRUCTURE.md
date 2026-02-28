# Project Structure Overview

```
saas-monorepo/
│
├── 📦 package.json                    # Root package with workspace config
├── 📄 README.md                       # Main documentation
├── 📄 SETUP.md                        # Quick start guide
├── 📄 ARCHITECTURE.md                 # Architecture documentation
├── 📄 DEPLOYMENT.md                   # Deployment guide
├── 🚫 .gitignore                      # Git ignore rules
│
├── 📁 apps/                           # Applications
│   │
│   ├── 📁 web/                        # Next.js Frontend (Port 3000)
│   │   ├── 📦 package.json
│   │   ├── ⚙️  next.config.js
│   │   ├── ⚙️  tsconfig.json
│   │   ├── ⚙️  tailwind.config.js
│   │   ├── 📄 .env.local.example
│   │   │
│   │   └── 📁 src/
│   │       ├── 📁 app/                # Next.js App Router
│   │       │   ├── 📄 layout.tsx      # Root layout with AuthProvider
│   │       │   ├── 📄 page.tsx        # Home (redirects to login/customers)
│   │       │   ├── 🎨 globals.css     # Tailwind CSS
│   │       │   │
│   │       │   ├── 📁 api/            # 🔐 EMBEDDED API ROUTES
│   │       │   │   └── 📁 auth/
│   │       │   │       └── 📁 [...nextauth]/
│   │       │   │           ├── 🔐 auth-options.ts    # NextAuth config
│   │       │   │           └── 🔐 route.ts           # Auth handler
│   │       │   │
│   │       │   ├── 📁 login/          # Login page
│   │       │   │   └── 📄 page.tsx
│   │       │   │
│   │       │   └── 📁 customers/      # Customers page
│   │       │       └── 📄 page.tsx    # Fetches from BFF
│   │       │
│   │       └── 📁 components/
│   │           ├── 🔐 AuthProvider.tsx      # Session provider
│   │           ├── 🧩 Header.tsx            # App header
│   │           └── 🧩 CustomersList.tsx     # Customer table
│   │
│   └── 📁 bff/                        # BFF Service (Port 3001)
│       ├── 📦 package.json
│       ├── ⚙️  tsconfig.json
│       ├── 📄 .env.example
│       │
│       └── 📁 src/
│           ├── 🚀 index.ts            # Express server
│           │
│           └── 📁 routes/
│               └── 🔌 customers.ts    # Customer API endpoint
│
└── 📁 packages/                       # Shared packages
    │
    └── 📁 shared-types/               # Shared TypeScript types
        ├── 📦 package.json
        ├── ⚙️  tsconfig.json
        │
        └── 📁 src/
            └── 📘 index.ts            # Common interfaces
                                       # - User, Customer
                                       # - API responses

═══════════════════════════════════════════════════════════

Key Features by File:

🔐 Authentication (Embedded in Web App):
   - apps/web/src/app/api/auth/[...nextauth]/auth-options.ts
   - Validates: email/password credentials
   - Creates JWT session
   - Server-side security

📄 Pages:
   - apps/web/src/app/login/page.tsx
     → Login form with NextAuth integration
   
   - apps/web/src/app/customers/page.tsx
     → Server component that:
       1. Validates session
       2. Fetches from BFF
       3. Renders customer list

🔌 BFF Routes:
   - apps/bff/src/routes/customers.ts
     → GET /api/customers
     → Returns mock customer data
     → In production: query database

📘 Shared Types:
   - packages/shared-types/src/index.ts
     → Customer, User, LoginRequest, etc.
     → Used by both web and bff

═══════════════════════════════════════════════════════════

Data Flow:

1. User Login:
   Browser → Next.js Login Page → /api/auth/[...nextauth] → Session Created

2. View Customers:
   Browser → Next.js /customers → BFF /api/customers → Customer Data
   
3. Type Safety:
   Both Web App and BFF use shared-types package for consistency

═══════════════════════════════════════════════════════════

Development Commands:

From root directory:
  npm install              # Install all dependencies
  npm run dev              # Run both web + bff
  npm run dev:web          # Run web only (port 3000)
  npm run dev:bff          # Run bff only (port 3001)
  npm run build            # Build everything

Access:
  Web:  http://localhost:3000
  BFF:  http://localhost:3001
  Login: admin / password

═══════════════════════════════════════════════════════════
```
