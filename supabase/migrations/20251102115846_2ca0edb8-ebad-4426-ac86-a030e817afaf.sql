-- إضافة حقل images لدعم الصور المتعددة
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- تحديث البيانات الحالية: نقل image_url إلى images
UPDATE public.offers 
SET images = jsonb_build_array(
  jsonb_build_object('url', image_url, 'is_primary', true)
)
WHERE image_url IS NOT NULL AND images = '[]'::jsonb;