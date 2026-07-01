# Payment Integration Guide

## Current State

The payment system uses `TestPaymentProvider` which simulates successful payments.
All business logic (wallet updates, transaction history, audit logs) is fully implemented.

## Adding a Real Payment Provider

### 1. Implement the Provider

Create a new file in `src/services/payments/providers/`:

```typescript
// src/services/payments/providers/yookassa.provider.ts
import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "../PaymentProvider";

export class YooKassaProvider implements PaymentProvider {
  name = "YooKassa";

  constructor(
    private readonly shopId: string,
    private readonly secretKey: string
  ) {}

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implement real API call
  }

  // ... implement all interface methods
}
```

### 2. Register the Provider

Edit `src/services/payments/PaymentService.ts`:

```typescript
private getProvider(): PaymentProvider {
  if (!this.provider) {
    this.provider = new YooKassaProvider(
      process.env.YOOKASSA_SHOP_ID!,
      process.env.YOOKASSA_SECRET_KEY!
    );
  }
  return this.provider!;
}
```

### 3. Update Environment Variables

Add to `.env.local`:
```
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

### 4. Update Topup Page

In `src/app/topup/page.tsx`, replace the test payment handler:

```typescript
const handleRealPayment = async () => {
  const payment = await PaymentService.createPayment({
    userId: user.id,
    amount: PACKAGES[selected].credits,
    description: `Purchase ${PACKAGES[selected].credits} Credits`,
  });
  
  if (payment.paymentUrl) {
    window.location.href = payment.paymentUrl;
  }
};
```

### 5. Handle Webhooks

Create an API route for webhook callbacks:

```typescript
// src/app/api/webhooks/payment/route.ts
export async function POST(request: Request) {
  const payload = await request.json();
  const result = await PaymentService.handleWebhook(payload);
  return NextResponse.json(result);
}
```

## Supported Providers

| Provider | File | Status |
|----------|------|--------|
| YooKassa | `yookassa.provider.ts` | Stub |
| SBP | `sbp.provider.ts` | Stub |
| Stripe | `stripe.provider.ts` | Stub |
| CloudPayments | `cloudpayments.provider.ts` | Stub |

## Architecture

```
Client (Topup Page)
  → PaymentService.createPayment()
    → PaymentProvider.createPayment()  // Replaceable
      → Real API call (YooKassa/Stripe/SBP)
  → Webhook → PaymentService.handleWebhook()
    → depositCredits()
    → recordPurchase()
    → logAuditEvent()