-- جدول متابعة المتاجر
CREATE TABLE IF NOT EXISTS public.store_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- Enable RLS
ALTER TABLE public.store_follows ENABLE ROW LEVEL SECURITY;

-- Policies for store_follows
CREATE POLICY "Users can view their own follows"
  ON public.store_follows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follows"
  ON public.store_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows"
  ON public.store_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_offer', 'new_product', 'featured_product', 'store_update', 'system')),
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- جدول اشتراكات الإشعارات Push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_follows_user_id ON public.store_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_store_follows_store_id ON public.store_follows(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger لإنشاء إشعارات عند إضافة عروض جديدة
CREATE OR REPLACE FUNCTION notify_followers_on_new_offer()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء إشعار لكل متابع للمتجر
  INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
  SELECT 
    sf.user_id,
    'عرض جديد في متجر تتابعه',
    'تم إضافة عرض جديد: ' || NEW.title,
    'new_offer',
    NEW.id,
    'offer'
  FROM public.store_follows sf
  WHERE sf.store_id = NEW.store_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_on_new_offer
  AFTER INSERT ON public.offers
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION notify_followers_on_new_offer();

-- Trigger لإنشاء إشعارات عند إضافة منتجات مميزة جديدة
CREATE OR REPLACE FUNCTION notify_followers_on_featured_product()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء إشعار لكل متابع للمتجر عند إضافة منتج مميز
  IF NEW.is_featured = true AND (OLD IS NULL OR OLD.is_featured = false) THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
    SELECT 
      sf.user_id,
      'منتج مميز جديد في متجر تتابعه',
      'تم إضافة منتج مميز: ' || NEW.name,
      'featured_product',
      NEW.id,
      'product'
    FROM public.store_follows sf
    WHERE sf.store_id = NEW.store_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_on_featured_product
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  WHEN (NEW.is_featured = true)
  EXECUTE FUNCTION notify_followers_on_featured_product();