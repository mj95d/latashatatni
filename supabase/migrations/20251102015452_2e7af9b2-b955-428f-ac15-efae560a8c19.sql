-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_merchant_id ON subscription_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_stores_plan_expires ON stores(plan_expires_at) WHERE plan_expires_at IS NOT NULL;

-- Add check constraint for valid plans
ALTER TABLE stores ADD CONSTRAINT check_valid_plan CHECK (plan IN ('free', 'premium', 'business'));
ALTER TABLE subscription_requests ADD CONSTRAINT check_valid_plan_request CHECK (plan IN ('free', 'premium', 'business'));

-- Add check constraint for valid statuses
ALTER TABLE subscription_requests ADD CONSTRAINT check_valid_status CHECK (status IN ('pending_payment', 'pending_review', 'approved', 'rejected'));

-- Add check constraint for valid durations
ALTER TABLE subscription_requests ADD CONSTRAINT check_valid_duration CHECK (duration IN ('1-month', '3-months', '1-year'));