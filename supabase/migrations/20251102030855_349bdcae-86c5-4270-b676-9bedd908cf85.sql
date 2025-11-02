-- حذف الـ trigger القديم لأننا سندمج الوظيفة
DROP TRIGGER IF EXISTS on_merchant_signup ON auth.users;
DROP FUNCTION IF EXISTS public.handle_merchant_signup();

-- تحديث دالة handle_new_user لتشمل منطق التاجر
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إنشاء الملف الشخصي
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, is_merchant)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'is_merchant')::boolean, false)
  );
  
  -- إذا كان المستخدم سجل كتاجر، أضف دور merchant
  IF NEW.raw_user_meta_data->>'is_merchant' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'merchant'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء دالة للتحقق من حد الإعلانات (10 إعلانات لكل متجر)
CREATE OR REPLACE FUNCTION public.check_offers_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offers_count INTEGER;
  store_owner UUID;
  user_role app_role;
BEGIN
  -- الحصول على صاحب المتجر
  SELECT owner_id INTO store_owner
  FROM public.stores
  WHERE id = NEW.store_id;
  
  -- التحقق من دور المستخدم
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = store_owner AND role = 'merchant'::app_role
  LIMIT 1;
  
  -- إذا كان المستخدم تاجر (وليس admin)، تحقق من الحد
  IF user_role = 'merchant'::app_role THEN
    -- عد الإعلانات النشطة للمتجر
    SELECT COUNT(*) INTO offers_count
    FROM public.offers
    WHERE store_id = NEW.store_id 
      AND is_active = true;
    
    -- التحقق من الحد (10 إعلانات)
    IF offers_count >= 10 THEN
      RAISE EXCEPTION 'لقد وصلت للحد الأقصى من الإعلانات (10 إعلانات مجانية). يرجى الترقية للباقة المدفوعة لإضافة المزيد.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger للتحقق من حد الإعلانات قبل الإضافة
DROP TRIGGER IF EXISTS check_offers_limit_trigger ON public.offers;
CREATE TRIGGER check_offers_limit_trigger
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_offers_limit();