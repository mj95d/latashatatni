-- Add new fields to merchant_requests table for enhanced registration
ALTER TABLE public.merchant_requests
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS commercial_document TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT;