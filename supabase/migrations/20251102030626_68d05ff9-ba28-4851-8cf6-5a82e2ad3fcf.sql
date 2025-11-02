-- إضافة عمود لتحديد ما إذا كان المستخدم سجل كتاجر
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_merchant BOOLEAN DEFAULT FALSE;

-- دالة لإضافة دور merchant للمستخدمين الجدد الذين سجلوا كتجار
CREATE OR REPLACE FUNCTION public.handle_merchant_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا كان المستخدم سجل كتاجر، أضف دور merchant
  IF NEW.raw_user_meta_data->>'is_merchant' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'merchant'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- تحديث جدول profiles
    UPDATE public.profiles
    SET is_merchant = TRUE
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتفعيل الدالة عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_merchant_signup ON auth.users;
CREATE TRIGGER on_merchant_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_merchant_signup();