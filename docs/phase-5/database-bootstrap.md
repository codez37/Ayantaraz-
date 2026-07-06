# Database Bootstrap

## Prisma Setup

### Schema Location
- Root `prisma/schema.prisma`
- All models with `@map()` and `@@map()` for Persian snake_case

### Migration
```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run pending migrations
pnpm db:push        # Push schema (dev only)
pnpm db:seed        # Seed initial data
```

### Seed Data
- Admin user (phone: 09120000000)
- FAQ knowledge base entries (10-15 items)
- Content categories (tax, accounting, general)
- Sample courses (2-3, draft status)

### Backup
- `scripts/backup.sh`: PostgreSQL dump via pg_dump
- Scheduled: daily via cron or infra scheduler
- Retention: 7 daily, 4 weekly, 3 monthly
