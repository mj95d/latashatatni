-- Add store limit check function
CREATE OR REPLACE FUNCTION public.check_store_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  store_count INTEGER;
BEGIN
  -- Count existing stores for this user
  SELECT COUNT(*) INTO store_count
  FROM public.stores
  WHERE owner_id = NEW.owner_id;
  
  -- Check if user has reached the limit of 10 stores
  IF store_count >= 10 THEN
    RAISE EXCEPTION 'لقد وصلت للحد الأقصى من المتاجر (10 متاجر)';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce store limit
DROP TRIGGER IF EXISTS enforce_store_limit ON public.stores;
CREATE TRIGGER enforce_store_limit
BEFORE INSERT ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.check_store_limit();

-- Update storage bucket to set file size limit and allowed mime types
UPDATE storage.buckets
SET 
  file_size_limit = 5242880, -- 5MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ]
WHERE id = 'store-documents';

-- Add RLS policy for storage to prevent PHP and executable files
CREATE POLICY "Prevent dangerous file uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  -- Block dangerous file extensions
  name !~* '\.(php|phtml|php3|php4|php5|phps|cgi|pl|py|rb|sh|exe|bat|cmd|com|jar|jsp|asp|aspx)$'
);