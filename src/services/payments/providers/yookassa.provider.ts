import { PaymentProvider, PaymentRequest, PaymentResponse, PaymentStatus } from "../PaymentProvider";

/**
 * YooKassa (ЮKassa) Payment Provider
 *
 * TODO: Implement real YooKassa API integration:
 * - Get shopId and secretKey from YooKassa dashboard
 * - Use yookassa-sdk or direct API calls
 * - Handle payment confirmation via webhook
 * - Implement refund flow
 */
export class YooKassaProvider implements PaymentProvider {
  name = "YooKassa";

  constructor(
    private readonly shopId?: string,
    private readonly secretKey?: string
  ) {}

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Implement YooKassa payment creation
    // const payment = await yooKassa.createPayment({
    //   amount: { value: request.amount, currency: "RUB" },
    //   confirmation: { type: "redirect", return_url: "..." },
    //   description: request.description,
    // });
    throw new Error("YooKassa provider not implemented yet");
  }

  async checkPayment(transactionId: string): Promise<PaymentStatus> {
    throw new Error("YooKassa provider not implemented yet");
  }

  async cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    throw new Error("YooKassa provider not implemented yet");
  }

  async refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
    throw new Error("YooKassa provider not implemented yet");
  }

  async handleWebhook(payload: unknown): Promise<{ success: boolean; transactionId?: string }> {
    throw new Error("YooKassa provider not implemented yet");
  }

  async createInvoice(request: PaymentRequest): Promise<{ invoiceUrl?: string; invoiceId?: string }> {
    throw new Error("YooKassa provider not implemented yet");
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    throw new Error("YooKassa provider not implemented yet");
  }
}