import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "./PaymentProvider";

/**
 * TestPaymentProvider — mock for development.
 * Replace with a real provider in production.
 */
export class TestPaymentProvider implements PaymentProvider {
  name = "TestPayment";

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Replace with real payment API call
    // Example for YooKassa:
    //   const payment = await yooKassa.createPayment({ amount: request.amount, ... });
    //   return { success: true, transactionId: payment.id, paymentUrl: payment.confirmationUrl };
    return {
      success: true,
      transactionId: `test_${Date.now()}`,
    };
  }

  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    // TODO: Call real provider API
    return { status: "COMPLETED", transactionId, amount: 0 };
  }

  async cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Call real provider API
    return { success: true };
  }

  async refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Call real provider API
    return { success: true };
  }

  async handleWebhook(payload: unknown): Promise<{ success: boolean; transactionId?: string }> {
    // TODO: Verify webhook signature
    return { success: true };
  }

  async createInvoice(request: PaymentRequest): Promise<{ invoiceUrl?: string; invoiceId?: string }> {
    // TODO: Generate real invoice
    return { invoiceId: `inv_${Date.now()}` };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    return { status: "COMPLETED", transactionId, amount: 0 };
  }
}