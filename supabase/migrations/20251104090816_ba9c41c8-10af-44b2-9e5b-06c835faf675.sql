-- Add location fields to merchant_requests table
ALTER TABLE public.merchant_requests
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS address TEXT;