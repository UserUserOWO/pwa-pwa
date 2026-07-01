-- ============================================================
-- SECURITY & MODERATION TABLES
-- Adds tables for content moderation, reports, email verification,
-- trust scores, and rate limiting.
-- ============================================================

-- ============================================================
-- 1. REVIEW REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISMISSED', 'ACTIONED')),
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reported_by ON review_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can submit reports" ON review_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON review_reports;
DROP POLICY IF EXISTS "Moderators can manage reports" ON review_reports;

CREATE POLICY "Users can submit reports"
  ON review_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
  ON review_reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Moderators can manage reports"
  ON review_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 2. EMAIL VERIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verifications" ON email_verifications;
DROP POLICY IF EXISTS "System can insert verifications" ON email_verifications;

CREATE POLICY "Users can view own verifications"
  ON email_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert verifications"
  ON email_verifications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 3. TRUST SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_trust_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  email_verified BOOLEAN DEFAULT false,
  account_age_days INTEGER DEFAULT 0,
  total_reports INTEGER DEFAULT 0,
  total_complaints INTEGER DEFAULT 0,
  quality_reviews INTEGER DEFAULT 0,
  blocks_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_trust_scores_user_id ON user_trust_scores(user_id);

ALTER TABLE user_trust_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trust score" ON user_trust_scores;
DROP POLICY IF EXISTS "System can update trust scores" ON user_trust_scores;

CREATE POLICY "Users can view own trust score"
  ON user_trust_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update trust scores"
  ON user_trust_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 4. ADD REVIEW STATUS COLUMN (immutability)
-- ============================================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED'
  CHECK (status IN ('PUBLISHED', 'PENDING', 'HIDDEN', 'DELETED', 'REJECTED'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- ============================================================
-- 5. TRIGGER: auto-create trust score on signup
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created_trust ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_trust();

CREATE OR REPLACE FUNCTION public.handle_new_user_trust()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_trust_scores (user_id, score)
  VALUES (new.id, 50);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_trust
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trust();

-- ============================================================
-- 6. REVIEWS: Only allow insert, never update text/rating
-- ============================================================
-- This is enforced at app level + RLS. Reviews are immutable.
-- Only status can be changed (by moderators).
DROP POLICY IF EXISTS "Reviews are immutable" ON reviews;
DROP POLICY IF EXISTS "Moderators can update review status" ON reviews;

CREATE POLICY "Moderators can update review status"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 7. INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_moderated_at ON reviews(moderated_at DESC);