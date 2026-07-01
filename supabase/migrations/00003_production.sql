-- ============================================================
-- PRODUCTION DATABASE SETUP
-- Adds tables for roles, permissions, audit logs, payments,
-- purchase history, moderation, and security.
-- ============================================================

-- ============================================================
-- 1. ROLES & PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'BUSINESS', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Auto-create user_role on signup
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'USER');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- ============================================================
-- 2. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 3. PURCHASE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'test',
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_created_at ON purchase_history(created_at DESC);

ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchase_history;
DROP POLICY IF EXISTS "System can insert purchases" ON purchase_history;

CREATE POLICY "Users can view own purchases"
  ON purchase_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchases"
  ON purchase_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. MODERATION
-- ============================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')),
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_entity ON moderation_queue(entity_type, entity_id);

ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Moderators can view moderation queue" ON moderation_queue;
DROP POLICY IF EXISTS "Users can submit reports" ON moderation_queue;
DROP POLICY IF EXISTS "Moderators can update moderation" ON moderation_queue;

CREATE POLICY "Moderators can view moderation queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Users can submit reports"
  ON moderation_queue FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Moderators can update moderation"
  ON moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================
-- 5. NOTIFICATIONS (future)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can mark notifications read" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. WALLETS: Add trigger for existing users without wallets
-- ============================================================
-- Insert missing wallets for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.wallets)
ON CONFLICT (user_id) DO NOTHING;