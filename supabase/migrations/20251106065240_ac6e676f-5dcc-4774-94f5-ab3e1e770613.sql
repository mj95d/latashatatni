-- Create media library table for managing all site images
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  category TEXT, -- hero, city, store, product, offer, general, etc.
  alt_text TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Media is viewable by everyone"
  ON public.media_library
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all media"
  ON public.media_library
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create site_settings table for dynamic content
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT, -- images, text, config, etc.
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Settings are viewable by everyone"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all settings"
  ON public.site_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create media bucket for general site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for site-media bucket
CREATE POLICY "Anyone can view site media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'site-media');

CREATE POLICY "Admins can upload site media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'site-media' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update site media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'site-media' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete site media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'site-media' AND
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Add triggers for updated_at
CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_media_library_category ON public.media_library(category);
CREATE INDEX idx_media_library_uploaded_by ON public.media_library(uploaded_by);
CREATE INDEX idx_site_settings_category ON public.site_settings(category);
CREATE INDEX idx_site_settings_key ON public.site_settings(setting_key);