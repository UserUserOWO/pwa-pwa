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
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
    };
  };
}