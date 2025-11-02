-- إنشاء حساب أدمن جديد بكلمة مرور مؤقتة
-- إضافة مستخدم جديد بدور admin مباشرة في قاعدة البيانات

-- أولاً، إدراج دور admin للمستخدم الحالي إذا لم يكن موجوداً
INSERT INTO public.user_roles (user_id, role)
VALUES ('c5eec1f5-1428-4847-9319-d1ebd0335069', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- التأكد من وجود ملف شخصي للمستخدم
INSERT INTO public.profiles (id, full_name, phone, is_merchant)
VALUES ('c5eec1f5-1428-4847-9319-d1ebd0335069', 'عبدالمجيد حسين الزهراني', '0595154405', false)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;