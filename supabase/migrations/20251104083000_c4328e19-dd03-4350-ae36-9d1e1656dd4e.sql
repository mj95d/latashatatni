-- إنشاء Storage bucket للمنتجات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Merchants can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Merchants can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Merchants can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

-- Add trigger to check product limit per store
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  product_count INTEGER;
  store_plan TEXT;
BEGIN
  -- Get store plan
  SELECT plan INTO store_plan
  FROM stores
  WHERE id = NEW.store_id;
  
  -- Count products for this store
  SELECT COUNT(*) INTO product_count
  FROM products
  WHERE store_id = NEW.store_id;
  
  -- Check limit (10 products for free plan)
  IF store_plan = 'free' AND product_count >= 10 THEN
    RAISE EXCEPTION 'لقد وصلت للحد الأقصى من المنتجات (10 منتجات). يرجى الترقية للباقة المدفوعة.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS check_product_limit_trigger ON products;
CREATE TRIGGER check_product_limit_trigger
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_limit();