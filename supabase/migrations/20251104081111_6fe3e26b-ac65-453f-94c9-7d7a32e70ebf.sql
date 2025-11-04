-- إصلاح دالة calculate_response_time لتكون آمنة
CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'DONE'::order_status AND OLD.status != 'DONE'::order_status THEN
    NEW.completed_at = now();
    NEW.response_time_minutes = EXTRACT(EPOCH FROM (now() - NEW.created_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$;