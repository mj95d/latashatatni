-- Function to check if store is approved (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_store_approved(_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(approved, false)
  FROM public.stores
  WHERE id = _store_id
$$;

-- Update products RLS policy - only allow insert if store is approved
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
CREATE POLICY "Store owners can manage their products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM stores
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM stores
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
    AND stores.approved = true  -- Must be approved to add products
  )
);