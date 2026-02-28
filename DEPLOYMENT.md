# Deployment Guide

## Deployment Options

### Option 1: Vercel (Web) + AWS ECS (BFF)

#### Web App Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy from root**
```bash
cd apps/web
vercel
```

3. **Environment Variables in Vercel Dashboard**
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-random-secret>
BFF_INTERNAL_URL=https://bff.internal.yourcompany.com
```

#### BFF Deployment (AWS ECS)

1. **Create Dockerfile for BFF**
```dockerfile
# apps/bff/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/bff/package*.json ./apps/bff/
COPY packages/shared-types/package*.json ./packages/shared-types/

# Install dependencies
RUN npm install

# Copy source
COPY apps/bff ./apps/bff
COPY packages/shared-types ./packages/shared-types

# Build
WORKDIR /app/apps/bff
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/bff/dist ./dist
COPY --from=builder /app/apps/bff/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

2. **Build and Push to ECR**
```bash
# Build
docker build -f apps/bff/Dockerfile -t saas-bff .

# Tag
docker tag saas-bff:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/saas-bff:latest

# Push
docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/saas-bff:latest
```

3. **Create ECS Task Definition**
```json
{
  "family": "saas-bff",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [{
    "name": "bff",
    "image": "<aws-account>.dkr.ecr.<region>.amazonaws.com/saas-bff:latest",
    "portMappings": [{
      "containerPort": 3001,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "3001"}
    ]
  }]
}
```

4. **Network Configuration**
- Deploy in **private subnet** (no public IP)
- Create internal load balancer
- Security group: Allow inbound from web app subnet only

---

### Option 2: All on AWS (Next.js on Amplify + BFF on ECS)

#### Web App (AWS Amplify)

1. **Connect Repository**
   - Link GitHub/GitLab repo
   - Select `apps/web` as root directory

2. **Build Settings** (amplify.yml)
```yaml
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - cd ../..
            - npm ci
            - npm run build --workspace=@saas/shared-types
        build:
          commands:
            - cd apps/web
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
    environment:
      variables:
        NEXTAUTH_URL: 'https://your-app.amplifyapp.com'
        BFF_INTERNAL_URL: 'http://bff.internal.yourcompany.com:3001'
```

#### BFF (Same as Option 1 ECS)

---

### Option 3: Kubernetes (GKE/EKS)

#### Web App Deployment
```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: saas-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: saas-web
  template:
    metadata:
      labels:
        app: saas-web
    spec:
      containers:
      - name: web
        image: your-registry/saas-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXTAUTH_URL
          value: "https://your-app.com"
        - name: BFF_INTERNAL_URL
          value: "http://saas-bff-service:3001"
---
apiVersion: v1
kind: Service
metadata:
  name: saas-web-service
spec:
  type: LoadBalancer
  selector:
    app: saas-web
  ports:
  - port: 80
    targetPort: 3000
```

#### BFF Deployment
```yaml
# k8s/bff-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: saas-bff
spec:
  replicas: 2
  selector:
    matchLabels:
      app: saas-bff
  template:
    metadata:
      labels:
        app: saas-bff
    spec:
      containers:
      - name: bff
        image: your-registry/saas-bff:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: saas-bff-service
spec:
  type: ClusterIP  # Internal only!
  selector:
    app: saas-bff
  ports:
  - port: 3001
    targetPort: 3001
```

---

## Production Environment Variables

### Web App (.env.production)
```bash
# Authentication
NEXTAUTH_URL=https://your-production-url.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# BFF Configuration
BFF_INTERNAL_URL=http://bff.internal.yourcompany.com:3001
# or for k8s: http://saas-bff-service:3001

# Optional: External APIs
# STRIPE_SECRET_KEY=sk_live_...
# SENDGRID_API_KEY=SG...
```

### BFF (.env.production)
```bash
# Server
NODE_ENV=production
PORT=3001

# Web App (for CORS)
WEB_APP_URL=https://your-production-url.com

# Database
DATABASE_URL=postgresql://user:pass@db.internal:5432/saas_production

# Redis
REDIS_URL=redis://redis.internal:6379

# Optional: External services
# AWS_REGION=us-east-1
# S3_BUCKET=saas-uploads
```

---

## Security Checklist

### Before Deploying to Production

- [ ] **Secrets**: Use secret management (AWS Secrets Manager, HashiCorp Vault)
- [ ] **NEXTAUTH_SECRET**: Generate strong random secret
- [ ] **HTTPS**: Enable SSL/TLS for web app
- [ ] **Network**: BFF in private subnet, no public access
- [ ] **Firewall**: Security groups restrict BFF to web app only
- [ ] **CORS**: Restrict to production domain only
- [ ] **Rate Limiting**: Add to BFF (express-rate-limit)
- [ ] **Logging**: Set up CloudWatch/DataDog/Sentry
- [ ] **Monitoring**: Health checks, alerts
- [ ] **Database**: Connection pooling, read replicas
- [ ] **Backups**: Automated database backups

---

## Network Architecture (AWS Example)

```
┌─────────────────────────────────────────────────┐
│                    VPC                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Public Subnet (AZ-1)              │ │
│  │                                           │ │
│  │   ┌─────────────────────────────────┐    │ │
│  │   │   Internet Gateway              │    │ │
│  │   └────────────┬────────────────────┘    │ │
│  │                │                          │ │
│  │   ┌────────────▼────────────────────┐    │ │
│  │   │   Application Load Balancer     │    │ │
│  │   │   (HTTPS: 443)                  │    │ │
│  │   └────────────┬────────────────────┘    │ │
│  └────────────────┼───────────────────────────┘
│                   │
│  ┌────────────────▼───────────────────────────┐
│  │         Private Subnet (AZ-1)              │
│  │                                            │
│  │   ┌──────────────────────────────────┐    │
│  │   │   Next.js App (Fargate/EC2)      │    │
│  │   │   Port: 3000                     │    │
│  │   └────────────┬─────────────────────┘    │
│  │                │ Internal HTTP             │
│  │   ┌────────────▼─────────────────────┐    │
│  │   │   Internal Load Balancer         │    │
│  │   └────────────┬─────────────────────┘    │
│  │                │                           │
│  │   ┌────────────▼─────────────────────┐    │
│  │   │   BFF Service (Fargate/EC2)      │    │
│  │   │   Port: 3001                     │    │
│  │   │   ⚠️  NO PUBLIC IP               │    │
│  │   └────────────┬─────────────────────┘    │
│  │                │                           │
│  │   ┌────────────▼─────────────────────┐    │
│  │   │   RDS PostgreSQL                 │    │
│  │   │   Port: 5432                     │    │
│  │   └──────────────────────────────────┘    │
│  └────────────────────────────────────────────┘
└─────────────────────────────────────────────────┘

Security Groups:
- ALB: Allow 443 from 0.0.0.0/0
- Next.js: Allow 3000 from ALB only
- Internal LB: Allow 3001 from Next.js SG only  
- BFF: Allow 3001 from Internal LB only
- RDS: Allow 5432 from BFF SG only
```

---

## Monitoring & Observability

### Application Monitoring
```typescript
// apps/bff/src/index.ts - Add monitoring

import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Health check with metrics
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});
```

### Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Scaling Considerations

### Horizontal Scaling
- **Web App**: Auto-scale based on CPU/memory (ECS/K8s)
- **BFF**: Scale independently based on request rate
- **Database**: Read replicas for read-heavy workloads

### Caching Strategy
```typescript
// Add Redis caching to BFF
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

router.get('/customers', async (req, res) => {
  // Check cache
  const cached = await redis.get('customers');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Fetch from DB
  const customers = await db.customers.findMany();
  
  // Cache for 5 minutes
  await redis.setex('customers', 300, JSON.stringify(customers));
  
  res.json(customers);
});
```

---

## Cost Optimization

1. **Use Spot Instances** for BFF (AWS ECS/EKS)
2. **Auto-scaling**: Scale down during off-peak hours
3. **CDN**: Use CloudFront/Cloudflare for static assets
4. **Database**: Use connection pooling, optimize queries
5. **Caching**: Redis for frequently accessed data

---

## Rollback Strategy

1. **Version Tags**: Tag all Docker images
2. **Blue-Green Deployment**: Zero-downtime updates
3. **Database Migrations**: Always backward-compatible
4. **Feature Flags**: Enable/disable features without deploy

---

## Support & Troubleshooting

### Common Issues

**BFF Connection Timeout**
- Check security groups
- Verify BFF is in private subnet
- Check web app has route to BFF

**Session Issues**
- Verify NEXTAUTH_SECRET is consistent
- Check cookie domain settings
- Ensure NEXTAUTH_URL matches production URL

**CORS Errors**
- Update BFF CORS to allow production domain
- Check WEB_APP_URL environment variable
