# Stack Decision

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js + TypeScript | SEO, SSR, RTL support, production-ready, content-friendly |
| Backend | NestJS + TypeScript | Modular, testable, production-safe, workflow-friendly |
| Database | PostgreSQL | ACID, relational, audit-suitable, Persian collation |
| ORM | Prisma | Type-safe, clear migrations, DX, team-friendly |
| Cache/Queue | Redis | Fast, short-lived state, rate limiting, OTP storage |
| File Storage | MinIO / S3-compatible | Separated from DB, manageable, clean deployment |
| Reverse Proxy | Nginx | SSL termination, routing, static assets |
| Deployment | Docker + Compose | Consistent environments, rollback-friendly |
| OTP Provider | Kavenegar | Persian SMS provider, reliable API |

### Rejected Stacks
- **Microservices**: Overengineered for this domain
- **Django**: Good but not TypeScript-native; team preference for TS full-stack
- **GraphQL**: Unnecessary complexity; REST is sufficient
- **Serverless**: Not suitable for stateful workflows and long-running operations
- **External CMS**: Cannot enforce our strict content lifecycle and audit rules
