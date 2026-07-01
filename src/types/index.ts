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
}

export interface ReviewInsert {
  profile_id: string;
  reviewer_id: string;
  rating: number;
  text: string;
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
    };
  };
}