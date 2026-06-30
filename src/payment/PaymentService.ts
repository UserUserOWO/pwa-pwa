/**
 * PaymentService
 * 
 * Central service for handling payments.
 * Currently uses TestPaymentProvider for development.
 * 
 * To connect a real provider:
 * 1. Create a new class implementing PaymentProvider (e.g., StripeProvider, YooKassaProvider)
 * 2. Replace the provider in getProvider() method
 * 3. No other changes needed - business logic stays the same
 */

import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "./PaymentProvider";
import { TestPaymentProvider } from "./TestPaymentProvider";

class PaymentServiceClass {
  private provider: PaymentProvider | null = null;

  /**
   * Get the active payment provider.
   * Replace TestPaymentProvider with your real provider here.
   * 
   * Examples:
   * - new StripeProvider(stripeSecretKey)
   * - new YooKassaProvider(shopId, secretKey)
   * - new SBPProvider(apiKey)
   * - new CloudPaymentsProvider(publicId, apiKey)
   */
  private getProvider(): PaymentProvider {
    if (!this.provider) {
      // TODO: Replace with real payment provider
      // Example: this.provider = new StripeProvider(process.env.STRIPE_SECRET_KEY!);
      this.provider = new TestPaymentProvider();
    }
    return this.provider!;
  }

  /**
   * Create a payment and return payment details.
   * For real providers, this would return a payment URL for redirect.
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Add validation, logging, fraud checks here
    // TODO: Save pending transaction to database before calling provider
    return this.getProvider().createPayment(request);
  }

  /**
   * Check the status of an existing payment.
   */
  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    // TODO: Add caching, retry logic
    return this.getProvider().checkPayment(transactionId);
  }

  /**
   * Cancel a pending payment.
   */
  async cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Update transaction status in database
    return this.getProvider().cancelPayment(transactionId);
  }

  /**
   * Handle incoming webhook from payment provider.
   * This is called by the API route when a payment provider sends a webhook.
   */
  async handleWebhook(payload: any): Promise<{ success: boolean; transactionId?: string }> {
    // TODO: Verify webhook signature
    // TODO: Update transaction status in database
    // TODO: Update wallet balance
    // TODO: Send notification to user
    return this.getProvider().handleWebhook(payload);
  }
}

export const PaymentService = new PaymentServiceClass();