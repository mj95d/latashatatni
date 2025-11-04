-- إضافة عمود product_id إلى جدول whatsapp_orders
ALTER TABLE whatsapp_orders
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;