import { PaymentProvider, PaymentRequest, PaymentStatus } from "./PaymentProvider";
import { TestPaymentProvider } from "./TestPaymentProvider";

class PaymentServiceClass {
  private provider: PaymentProvider | null = null;

  private getProvider(): PaymentProvider {
    if (!this.provider) {
      // TODO: Replace with real payment provider when ready
      // Example: this.provider = new YooKassaProvider(shopId, secretKey);
      // Example: this.provider = new StripeProvider(stripeSecretKey);
      // Example: this.provider = new SBPProvider(apiKey);
      // Example: this.provider = new CloudPaymentsProvider(publicId, apiKey);
      this.provider = new TestPaymentProvider();
    }
    return this.provider!;
  }

  async createPayment(request: PaymentRequest) {
    // TODO: Add validation, save pending transaction to DB
    return this.getProvider().createPayment(request);
  }

  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    return this.getProvider().checkPayment(transactionId);
  }

  async cancelPayment(transactionId: string) {
    // TODO: Update transaction status in DB
    return this.getProvider().cancelPayment(transactionId);
  }

  async refundPayment(transactionId: string) {
    // TODO: Update wallet balance + transaction status
    return this.getProvider().refundPayment(transactionId);
  }

  async handleWebhook(payload: unknown) {
    // TODO: Verify webhook signature
    // TODO: Update wallet balance
    // TODO: Update transaction status
    return this.getProvider().handleWebhook(payload);
  }

  async createInvoice(request: PaymentRequest) {
    return this.getProvider().createInvoice(request);
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return this.getProvider().getPaymentStatus(transactionId);
  }
}

export const PaymentService = new PaymentServiceClass();