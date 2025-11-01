-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update stores policies to allow admins to manage all stores
CREATE POLICY "Admins can manage all stores"
ON public.stores
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update offers policies to allow admins to manage all offers
CREATE POLICY "Admins can manage all offers"
ON public.offers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update products policies to allow admins to manage all products
CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update cities policies to allow admins to manage cities
CREATE POLICY "Admins can manage cities"
ON public.cities
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update categories policies to allow admins to manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update tourism_places policies to allow admins to manage tourism places
CREATE POLICY "Admins can manage tourism places"
ON public.tourism_places
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));