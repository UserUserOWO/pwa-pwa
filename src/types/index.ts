export interface Profile {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  description: string | null;
  hashtags: string[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  profile_id: string;
  reviewer_id: string;
  rating: number;
  text: string;
  created_at: string;
  reviewer?: Profile;
  status?: "PUBLISHED" | "PENDING" | "HIDDEN" | "DELETED" | "REJECTED";
  rejection_reason?: string;
  moderated_at?: string;
}

export interface ReviewInsert {
  profile_id: string;
  reviewer_id: string;
  rating: number;
  text: string;
  status?: string;
  rejection_reason?: string;
}

// ==================== WALLET & CREDITS ====================

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "DEPOSIT" | "SPEND" | "REFUND";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  created_at: string;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  amount: number;
  credits: number;
  payment_provider: string;
  transaction_id: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  metadata: Record<string, unknown>;
  created_at: string;
}

// ==================== ROLES ====================

export type UserRoleType = "USER" | "BUSINESS" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
  updated_at: string;
}

// ==================== AUDIT ====================

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ==================== MODERATION ====================

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface ModerationItem {
  id: string;
  entity_type: string;
  entity_id: string;
  reported_by: string | null;
  reason: string;
  status: ModerationStatus;
  moderator_id: string | null;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  reported_by: string;
  reason: string;
  status: "PENDING" | "DISMISSED" | "ACTIONED";
  created_at: string;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ==================== EMAIL VERIFICATION ====================

export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

// ==================== TRUST SCORE ====================

export interface TrustScore {
  id: string;
  user_id: string;
  score: number;
  email_verified: boolean;
  account_age_days: number;
  total_reports: number;
  total_complaints: number;
  quality_reviews: number;
  blocks_count: number;
  last_updated: string;
}

// ==================== DATABASE ====================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: Partial<ReviewInsert>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Wallet, "id" | "created_at" | "updated_at">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at">>;
      };
      purchase_history: {
        Row: PurchaseHistory;
        Insert: Omit<PurchaseHistory, "id" | "created_at">;
        Update: Partial<Omit<PurchaseHistory, "id" | "created_at">>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserRole, "id" | "created_at" | "updated_at">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
      };
      moderation_queue: {
        Row: ModerationItem;
        Insert: Omit<ModerationItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ModerationItem, "id" | "created_at" | "updated_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
      review_reports: {
        Row: ReviewReport;
        Insert: Omit<ReviewReport, "id" | "created_at">;
        Update: Partial<Omit<ReviewReport, "id" | "created_at">>;
      };
      email_verifications: {
        Row: EmailVerification;
        Insert: Omit<EmailVerification, "id" | "created_at">;
        Update: Partial<Omit<EmailVerification, "id" | "created_at">>;
      };
      user_trust_scores: {
        Row: TrustScore;
        Insert: Omit<TrustScore, "id" | "last_updated">;
        Update: Partial<Omit<TrustScore, "id" | "last_updated">>;
      };
    };
  };
}