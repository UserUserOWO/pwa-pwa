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
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
    };
  };
}