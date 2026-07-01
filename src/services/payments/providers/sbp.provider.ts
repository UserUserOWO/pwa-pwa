import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "../PaymentProvider";

/**
 * SBP (СБП) Payment Provider
 *
 * TODO: Implement real SBP API integration:
 * - Get API keys from bank partner
 * - Implement QR-code generation for SBP
 * - Handle webhook callbacks
 * - Implement refund flow
 */
export class SBPProvider implements PaymentProvider {
  name = "SBP";

  constructor(
    private readonly apiKey?: string,
    private readonly merchantId?: string
  ) {}

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Implement SBP payment creation
    // const response = await sbpApi.createPayment({ ... });
    throw new Error("SBP provider not implemented yet");
  }

  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    throw new Error("SBP provider not implemented yet");
  }

  async cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    throw new Error("SBP provider not implemented yet");
  }

  async refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    throw new Error("SBP provider not implemented yet");
  }

  async handleWebhook(payload: unknown): Promise<{ success: boolean; transactionId?: string }> {
    throw new Error("SBP provider not implemented yet");
  }

  async createInvoice(request: PaymentRequest): Promise<{ invoiceUrl?: string; invoiceId?: string }> {
    throw new Error("SBP provider not implemented yet");
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    throw new Error("SBP provider not implemented yet");
  }
}