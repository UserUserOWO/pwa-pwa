/**
 * PaymentProvider interface
 *
 * Implement this interface to integrate a payment provider.
 * Currently all methods are stubs with TODO comments.
 *
 * To integrate a real provider:
 * 1. Create a new class (e.g., YooKassaProvider.ts)
 * 2. Implement this interface
 * 3. Register it in PaymentService
 *
 * Supported providers (ready for implementation):
 * - YooKassa (ЮKassa)
 * - SBP (СБП)
 * - Stripe
 * - CloudPayments
 */

export interface PaymentRequest {
  userId: string;
  amount: number;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface PaymentStatus {
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionId: string;
  amount: number;
}

export interface PaymentProvider {
  name: string;

  /** Create a payment and return confirmation or redirect URL */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /** Check payment status */
  checkPayment(transactionId: string): Promise<PaymentStatus>;

  /** Cancel a pending payment */
  cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }>;

  /** Refund a completed payment */
  refundPayment(transactionId: string): Promise<{ success: boolean; error?: string }>;

  /** Handle webhook from payment provider */
  handleWebhook(payload: unknown): Promise<{ success: boolean; transactionId?: string }>;

  /** Generate an invoice for the payment */
  createInvoice(request: PaymentRequest): Promise<{ invoiceUrl?: string; invoiceId?: string }>;

  /** Get current status of a payment */
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}