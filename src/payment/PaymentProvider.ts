/**
 * PaymentProvider interface
 * 
 * This interface defines the contract for payment providers.
 * To add a new provider, implement this interface and register it in PaymentService.
 * 
 * Future providers:
 * - SBP (СБП)
 * - YooKassa (ЮKassa)
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
  /** Name of the provider */
  name: string;

  /** Create a payment and return payment URL or confirmation */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /** Check the status of an existing payment */
  checkPayment(transactionId: string): Promise<PaymentStatus>;

  /** Cancel a pending payment */
  cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }>;

  /** Handle incoming webhook from payment provider */
  handleWebhook(payload: any): Promise<{ success: boolean; transactionId?: string }>;
}