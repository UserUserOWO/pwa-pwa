/**
 * TestPaymentProvider
 * 
 * A mock payment provider for development and testing.
 * Replace this with a real provider (Stripe, YooKassa, SBP, CloudPayments) in production.
 * 
 * The interface is identical - just swap the implementation.
 */

import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "./PaymentProvider";

export class TestPaymentProvider implements PaymentProvider {
  name = "TestPayment";

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Replace with real payment API call
    // Example for Stripe:
    //   const session = await stripe.checkout.sessions.create({ ... });
    //   return { success: true, transactionId: session.id, paymentUrl: session.url };
    //
    // Example for YooKassa:
    //   const payment = await yooKassa.createPayment({ ... });
    //   return { success: true, transactionId: payment.id, paymentUrl: payment.confirmation_url };

    return {
      success: true,
      transactionId: `test_${Date.now()}`,
      paymentUrl: null as any, // No redirect needed for test
    };
  }

  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    // TODO: Call real provider API to check payment status
    return {
      status: "COMPLETED",
      transactionId,
      amount: 0,
    };
  }

  async cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Call real provider API to cancel payment
    return { success: true };
  }

  async handleWebhook(payload: any): Promise<{ success: boolean; transactionId?: string }> {
    // TODO: Verify webhook signature and process
    return { success: true, transactionId: payload?.transactionId };
  }
}