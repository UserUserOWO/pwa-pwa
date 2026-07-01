# Security

## Overview

Security is implemented at multiple layers: database, middleware, and application.

## Database Security (RLS)

All tables have Row Level Security enabled:

| Table | Policy |
|-------|--------|
| profiles | Public read, owner write |
| reviews | Public read, authenticated insert |
| wallets | Owner read/write |
| transactions | Owner read, system insert |
| purchase_history | Owner read, system insert |
| user_roles | Owner read, admin write |
| audit_logs | Admin read, system insert |
| moderation_queue | Moderator read, user insert |
| notifications | Owner read/write |

## Application Security

### Role-Based Access

```typescript
enum UserRole {
  USER = 0,
  BUSINESS = 1,
  MODERATOR = 2,
  ADMIN = 3,
  SUPER_ADMIN = 4,
}
```

### Security Headers

Set via middleware:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy
- Permissions-Policy
- Referrer-Policy

### Credit System

- Balance is stored only in database
- All changes go through wallet.ts service
- Client never modifies balance directly
- Every transaction is logged

## Future Improvements

- Rate limiting
- 2FA authentication
- IP-based blocking
- Webhook signature verification
- API key rotation