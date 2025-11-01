-- إضافة merchant إلى الأدوار
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'merchant';

-- جدول طلبات التجار
CREATE TABLE IF NOT EXISTS public.merchant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  phone TEXT NOT NULL,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- تفعيل RLS
ALTER TABLE public.merchant_requests ENABLE ROW LEVEL SECURITY;

-- المستخدمون يمكنهم إنشاء طلباتهم الخاصة
CREATE POLICY "Users can create their own merchant requests"
ON public.merchant_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- المستخدمون يمكنهم رؤية طلباتهم الخاصة
CREATE POLICY "Users can view their own merchant requests"
ON public.merchant_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- الأدمن يمكنه رؤية جميع الطلبات
CREATE POLICY "Admins can view all merchant requests"
ON public.merchant_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- الأدمن يمكنه تحديث جميع الطلبات
CREATE POLICY "Admins can update all merchant requests"
ON public.merchant_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- إضافة trigger للتحديث التلقائي
CREATE TRIGGER update_merchant_requests_updated_at
BEFORE UPDATE ON public.merchant_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();