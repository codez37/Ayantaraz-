# Auth Data Model

## User
```prisma
model User {
  id          Int       @id @default(autoincrement())
  phone       String    @unique
  firstName   String    @default("") @map("first_name")
  lastName    String    @default("") @map("last_name")
  role        UserRole  @default(user)
  isActive    Boolean   @default(true) @map("is_active")
  lastLoginAt DateTime? @map("last_login_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  sessions         Session[]
  refreshTokens    RefreshToken[]
  auditLogs        AuditLog[]
}
```

## OTP
```prisma
model OTP {
  id         Int       @id @default(autoincrement())
  phone      String
  codeHash   String    @map("code_hash")
  attempts   Int       @default(0)
  status     OTPStatus @default(active)
  expiresAt  DateTime  @map("expires_at")
  sentAt     DateTime? @map("sent_at")
  verifiedAt DateTime? @map("verified_at")
  createdAt  DateTime  @default(now()) @map("created_at")
}
```

## Session
```prisma
model Session {
  id           Int       @id @default(autoincrement())
  userId       Int       @map("user_id")
  tokenId      String?   @map("token_id")
  deviceInfo   String?   @map("device_info")
  ipAddress    String?   @map("ip_address")
  lastActiveAt DateTime? @map("last_active_at")
  expiresAt    DateTime  @map("expires_at")
  revokedAt    DateTime? @map("revoked_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
}
```

## RefreshToken (existing)
```prisma
model RefreshToken {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  tokenHash String    @map("token_hash")
  isRevoked Boolean   @default(false) @map("is_revoked")
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
}
```
