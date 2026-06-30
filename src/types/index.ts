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
    };
  };
}