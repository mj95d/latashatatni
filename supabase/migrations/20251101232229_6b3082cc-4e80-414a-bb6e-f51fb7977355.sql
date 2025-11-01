-- Create storage bucket for store documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-documents', 'store-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for store documents
CREATE POLICY "Users can upload their own store documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own store documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'store-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all store documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'store-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add commercial_document column to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS commercial_document TEXT;