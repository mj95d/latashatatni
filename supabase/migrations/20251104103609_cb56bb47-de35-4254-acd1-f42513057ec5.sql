-- Add SKU (Stock Keeping Unit) field for unique product identifier
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;

-- Create index for better performance on SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Add check to ensure SKU is unique per store (optional - merchant can reuse SKUs across different stores)
-- But within a store, SKUs should be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_store_unique ON public.products(sku, store_id) WHERE sku IS NOT NULL;