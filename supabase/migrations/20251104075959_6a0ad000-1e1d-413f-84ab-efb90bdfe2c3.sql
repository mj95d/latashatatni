-- إنشاء جدول طلبات الواتساب
CREATE TABLE IF NOT EXISTS public.whatsapp_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_message TEXT NOT NULL,
  source_page TEXT NOT NULL,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بإنشاء طلبات
CREATE POLICY "Anyone can create whatsapp orders"
ON public.whatsapp_orders
FOR INSERT
TO public
WITH CHECK (true);

-- الأدمن يمكنه رؤية جميع الطلبات
CREATE POLICY "Admins can view all whatsapp orders"
ON public.whatsapp_orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- الأدمن يمكنه تحديث الطلبات
CREATE POLICY "Admins can update whatsapp orders"
ON public.whatsapp_orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- أصحاب المتاجر يمكنهم رؤية طلبات متاجرهم
CREATE POLICY "Store owners can view their whatsapp orders"
ON public.whatsapp_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = whatsapp_orders.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- Trigger لتحديث updated_at
CREATE TRIGGER update_whatsapp_orders_updated_at
BEFORE UPDATE ON public.whatsapp_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- إضافة فهرس للأداء
CREATE INDEX idx_whatsapp_orders_store_id ON public.whatsapp_orders(store_id);
CREATE INDEX idx_whatsapp_orders_created_at ON public.whatsapp_orders(created_at DESC);