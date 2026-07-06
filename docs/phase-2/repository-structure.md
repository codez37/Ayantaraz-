# Repository Structure

```
ayantaraz/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   ├── components/           # Shared components
│   │   │   ├── lib/                  # Utilities, API client
│   │   │   └── styles/               # RTL styles, globals
│   │   ├── public/                   # Static assets
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/             # Auth module
│       │   │   ├── users/            # Users module
│       │   │   ├── content/          # Content module
│       │   │   ├── courses/          # Courses module
│       │   │   ├── consultation/     # Consultation module
│       │   │   ├── orders/           # Orders/payment module
│       │   │   ├── chatbot/          # Chatbot module
│       │   │   ├── audit/            # Audit module
│       │   │   └── admin/            # Admin module
│       │   ├── common/               # Shared guards, decorators, filters
│       │   ├── prisma/               # Prisma service
│       │   └── main.ts               # Entry point
│       ├── prisma/
│       │   └── schema.prisma         # Database schema
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared types, DTOs
│       ├── src/
│       │   ├── types/               # Domain types
│       │   ├── constants/           # Shared constants
│       │   └── enums/               # Status enums
│       └── package.json
│
├── infra/
│   ├── nginx/
│   │   └── default.conf
│   └── scripts/
│       ├── backup.sh
│       └── deploy.sh
│
├── docs/
│   ├── phase-0/
│   ├── phase-1/
│   └── phase-2/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
└── README.md
```
