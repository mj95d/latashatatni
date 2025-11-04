-- Add approved column to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.stores.approved IS 'Store approval status - must be approved once before merchant can publish products';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stores_approved ON public.stores(approved);

-- Update RLS policy for products - only allow inserts if store is approved
DROP POLICY IF EXISTS "Authenticated users can create stores" ON public.stores;
CREATE POLICY "Authenticated users can create stores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND
  approved = false  -- New stores start as not approved
);