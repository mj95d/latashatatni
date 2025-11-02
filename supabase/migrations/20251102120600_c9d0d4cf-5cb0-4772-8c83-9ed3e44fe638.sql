-- إضافة حقول جديدة لجدول profiles لدعم الإيقاف والتفعيل
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'disabled', 'locked')),
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_login_ip text,
ADD COLUMN IF NOT EXISTS last_login_device text,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- إنشاء جدول user_activity لتتبع نشاط المستخدمين
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_description text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول user_activity
CREATE POLICY "Admins can view all activities"
  ON public.user_activity FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert activities"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);

-- إنشاء جدول admin_notifications للإشعارات
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('merchant_request', 'new_user', 'new_store', 'new_offer', 'report', 'warning')),
  related_id uuid,
  related_table text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للإشعارات
CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);