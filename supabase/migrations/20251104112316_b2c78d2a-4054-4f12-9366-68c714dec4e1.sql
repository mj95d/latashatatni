-- إضافة عمود product_id إلى جدول العروض لربط العروض بمنتجات محددة
ALTER TABLE public.offers 
ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;

-- إضافة index لتحسين الأداء
CREATE INDEX idx_offers_product_id ON public.offers(product_id);

-- إضافة عمود category للمنتجات لتصنيفها
ALTER TABLE public.products
ADD COLUMN category TEXT;

-- إضافة عمود stock_quantity لتتبع المخزون
ALTER TABLE public.products
ADD COLUMN stock_quantity INTEGER DEFAULT 0;

-- إضافة عمود is_featured للمنتجات المميزة
ALTER TABLE public.products
ADD COLUMN is_featured BOOLEAN DEFAULT false;