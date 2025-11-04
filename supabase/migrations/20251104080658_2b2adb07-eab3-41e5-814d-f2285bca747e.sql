-- إنشاء enum لحالة الطلب
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- تحديث جدول whatsapp_orders لإضافة الحقول الجديدة
ALTER TABLE public.whatsapp_orders
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS delivery_method TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER;

-- حذف القيمة الافتراضية أولاً
ALTER TABLE public.whatsapp_orders ALTER COLUMN status DROP DEFAULT;

-- تحديث العمود status ليستخدم enum
ALTER TABLE public.whatsapp_orders 
ALTER COLUMN status TYPE order_status 
USING status::order_status;

-- إضافة القيمة الافتراضية الجديدة
ALTER TABLE public.whatsapp_orders 
ALTER COLUMN status SET DEFAULT 'NEW'::order_status;

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_status ON public.whatsapp_orders(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_assigned_to ON public.whatsapp_orders(assigned_to);

-- تفعيل Realtime للجدول
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_orders;

-- دالة لحساب وقت الاستجابة تلقائياً
CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'DONE'::order_status AND OLD.status != 'DONE'::order_status THEN
    NEW.completed_at = now();
    NEW.response_time_minutes = EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لحساب وقت الاستجابة
DROP TRIGGER IF EXISTS trigger_calculate_response_time ON public.whatsapp_orders;
CREATE TRIGGER trigger_calculate_response_time
BEFORE UPDATE ON public.whatsapp_orders
FOR EACH ROW
EXECUTE FUNCTION calculate_response_time();