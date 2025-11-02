-- إنشاء جدول السجلات (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الإعدادات العامة
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول صلاحيات الأدمن
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_key TEXT NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(admin_id, permission_key)
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_id ON public.admin_permissions(admin_id);

-- تفعيل RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للسجلات
CREATE POLICY "Admins can view all logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- سياسات RLS للإعدادات
CREATE POLICY "Admins can manage settings"
  ON public.app_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public settings are viewable by everyone"
  ON public.app_settings FOR SELECT
  USING (is_public = true);

-- سياسات RLS للصلاحيات
CREATE POLICY "Admins can manage permissions"
  ON public.admin_permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view their own permissions"
  ON public.admin_permissions FOR SELECT
  USING (auth.uid() = admin_id);

-- دالة لتسجيل التغييرات تلقائياً
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email_var TEXT;
  user_name_var TEXT;
BEGIN
  -- الحصول على معلومات المستخدم
  SELECT email INTO user_email_var FROM auth.users WHERE id = auth.uid();
  SELECT full_name INTO user_name_var FROM public.profiles WHERE id = auth.uid();

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, user_name, action, table_name, record_id, old_data
    ) VALUES (
      auth.uid(), user_email_var, user_name_var, 'DELETE', TG_TABLE_NAME, OLD.id::text, row_to_json(OLD)
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, user_name, action, table_name, record_id, old_data, new_data
    ) VALUES (
      auth.uid(), user_email_var, user_name_var, 'UPDATE', TG_TABLE_NAME, NEW.id::text, row_to_json(OLD), row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, user_name, action, table_name, record_id, new_data
    ) VALUES (
      auth.uid(), user_email_var, user_name_var, 'CREATE', TG_TABLE_NAME, NEW.id::text, row_to_json(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- إضافة triggers للجداول المهمة
DROP TRIGGER IF EXISTS stores_audit_trigger ON public.stores;
CREATE TRIGGER stores_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS offers_audit_trigger ON public.offers;
CREATE TRIGGER offers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS user_roles_audit_trigger ON public.user_roles;
CREATE TRIGGER user_roles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

DROP TRIGGER IF EXISTS subscription_requests_audit_trigger ON public.subscription_requests;
CREATE TRIGGER subscription_requests_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscription_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- إدراج إعدادات افتراضية
INSERT INTO public.app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('site_name', '"لا تشتتني"', 'text', 'اسم الموقع', true),
  ('site_description', '"منصة لربط التجار بالعملاء"', 'text', 'وصف الموقع', true),
  ('maintenance_mode', 'false', 'boolean', 'وضع الصيانة', false),
  ('allow_registration', 'true', 'boolean', 'السماح بالتسجيل', false),
  ('max_stores_per_merchant', '10', 'number', 'الحد الأقصى للمتاجر لكل تاجر', false),
  ('max_offers_per_store', '10', 'number', 'الحد الأقصى للعروض لكل متجر', false),
  ('contact_email', '"info@latashtatni.com"', 'text', 'البريد الإلكتروني للتواصل', true),
  ('contact_phone', '"+966500000000"', 'text', 'رقم الهاتف للتواصل', true)
ON CONFLICT (setting_key) DO NOTHING;