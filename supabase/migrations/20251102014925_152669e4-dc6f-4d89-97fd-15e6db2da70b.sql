-- Add plan fields to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS product_limit integer DEFAULT 10;

-- Create subscription_requests table for pending subscriptions
CREATE TABLE IF NOT EXISTS subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  duration text NOT NULL, -- '1-month', '3-months', '1-year'
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment', -- 'pending_payment', 'pending_review', 'approved', 'rejected'
  payment_proof_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- Merchants can view their own requests
CREATE POLICY "Merchants can view own subscription requests"
ON subscription_requests FOR SELECT
USING (auth.uid() = merchant_id);

-- Merchants can create subscription requests
CREATE POLICY "Merchants can create subscription requests"
ON subscription_requests FOR INSERT
WITH CHECK (auth.uid() = merchant_id);

-- Merchants can update their own pending requests
CREATE POLICY "Merchants can update own pending requests"
ON subscription_requests FOR UPDATE
USING (auth.uid() = merchant_id AND status = 'pending_payment');

-- Admins can view all requests
CREATE POLICY "Admins can view all subscription requests"
ON subscription_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all requests
CREATE POLICY "Admins can update all subscription requests"
ON subscription_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_requests_updated_at
BEFORE UPDATE ON subscription_requests
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Update subscriptions table if needed
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_request_id uuid REFERENCES subscription_requests(id);