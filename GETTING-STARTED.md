# 🚀 Getting Started - SaaS Monorepo

Welcome! This is a production-ready monorepo with Next.js frontend and Node.js BFF.

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd saas-monorepo
npm install
npm install --workspaces
```

### 2. Set Up Environment Variables

**Web App:**
```bash
cd apps/web
cp .env.local.example .env.local
```

**BFF Service:**
```bash
cd apps/bff
cp .env.example .env
```

(Default values work for local development!)

### 3. Start Everything
```bash
# From root directory
npm run dev
```

This starts:
- ✅ Next.js Web App on http://localhost:3000
- ✅ BFF Service on http://localhost:3001

### 4. Login
1. Open http://localhost:3000
2. Create an account at /register with your name, email, and password
3. After registration, you'll be signed in automatically and routed to preferences
4. Complete preferences, then you'll see the customer list

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & flows
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - File structure visualization

## 🏗️ What's Included

### ✅ Next.js Web App (`apps/web`)
- Login screen with beautiful UI
- Customer list page
- NextAuth authentication (embedded)
- TypeScript + Tailwind CSS
- Server and client components

### ✅ BFF Service (`apps/bff`)
- Express.js REST API
- `/api/customers` endpoint
- TypeScript support
- Ready for database integration

### ✅ Shared Types (`packages/shared-types`)
- Common TypeScript interfaces
- Type safety across services
- Customer, User, API response types

## 🔐 Security Features

- ✅ NextAuth session management
- ✅ JWT tokens in httpOnly cookies
- ✅ Server-side authentication
- ✅ CSRF protection
- ✅ Private network architecture (production)

## 🎯 Key Features

### Embedded Auth
Authentication is handled directly in the Next.js app via API routes:
```
apps/web/src/app/api/auth/[...nextauth]/
```
Simple, secure, no extra service needed.

### BFF Communication
The web app fetches customer data from the BFF:
```typescript
// In customers page
const response = await fetch(`${BFF_URL}/api/customers`)
```

### Type Safety
Both apps use shared types:
```typescript
import { Customer } from '@saas/shared-types'
```

## 🛠️ Development

### Run Individual Apps
```bash
npm run dev:web    # Web app only
npm run dev:bff    # BFF only
```

### Build for Production
```bash
npm run build      # Build everything
npm run build:web  # Web app only
npm run build:bff  # BFF only
```

### Type Checking
```bash
npm run type-check  # Check all workspaces
```

## 📂 File Structure

```
saas-monorepo/
├── apps/
│   ├── web/           # Next.js (Port 3000)
│   └── bff/           # Express (Port 3001)
└── packages/
    └── shared-types/  # Common types
```

## 🔄 Migration Path

This architecture is designed to grow with you:

**Now**: Embedded auth + separate BFF
**Later**: Extract more services as needed

The code is already structured for easy extraction!

## 🧪 Testing the Setup

### 1. Test BFF Directly
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/customers
```

### 2. Test Web App
1. Navigate to http://localhost:3000
2. Register a new account (or login with your registered email/password)
3. View customer list
4. Check browser console (no errors!)
5. Check terminal logs (both services running)

## 📝 Next Steps

### Add Database
1. Install Prisma: `npm install prisma @prisma/client --workspace=apps/bff`
2. Initialize: `npx prisma init` in `apps/bff`
3. Update `customers.ts` to query database

### Add More Pages
1. Create new page in `apps/web/src/app/`
2. Add route in BFF if needed
3. Add types in `shared-types`

### Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide:
- Vercel + AWS
- All AWS (Amplify + ECS)
- Kubernetes

## 💡 Tips

- **Port conflicts?** Change ports in `.env` files
- **BFF not connecting?** Check it's running on 3001
- **Session issues?** Check NEXTAUTH_SECRET in .env.local
- **Type errors?** Run `npm run build` in shared-types

## 🆘 Need Help?

1. Check [SETUP.md](SETUP.md) for detailed instructions
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for how it works
3. Review code comments - they're extensive!

## 🎉 You're Ready!

You now have a production-ready SaaS platform architecture:
- ✅ Modern Next.js frontend
- ✅ Scalable BFF backend
- ✅ Type-safe communication
- ✅ Secure authentication
- ✅ Ready for production deployment

Happy coding! 🚀
