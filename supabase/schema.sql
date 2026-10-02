-- Enable the UUID extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-------------------------------------------------------------------
-- PROFILES TABLE
-------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  employee_number TEXT NOT NULL UNIQUE,
  primary_store TEXT NOT NULL,
  secondary_stores TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------
-- ITEMS TABLE
-------------------------------------------------------------------
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  long_code TEXT,
  short_code TEXT,
  barcode TEXT,
  size TEXT,
  colour TEXT,
  department TEXT,
  price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  is_marked_down BOOLEAN NOT NULL DEFAULT false,
  is_on_flash BOOLEAN NOT NULL DEFAULT false,
  photos TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_added TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------
-- INDEXES
-------------------------------------------------------------------
CREATE INDEX items_barcode_idx ON public.items(barcode);
CREATE INDEX items_long_code_idx ON public.items(long_code);
CREATE INDEX items_short_code_idx ON public.items(short_code);
-- A GIN index for full-text search on item name
CREATE INDEX items_name_idx ON public.items USING GIN (to_tsvector('english', name));
CREATE INDEX profiles_employee_number_idx ON public.profiles(employee_number);

-------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- 1. Anyone authenticated can SELECT all profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Users can INSERT their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Users can UPDATE their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Items Policies
-- 1. Anyone authenticated can SELECT all items
CREATE POLICY "Items are viewable by authenticated users"
  ON public.items FOR SELECT
  TO authenticated
  USING (true);

-- 2. Any authenticated user can INSERT new items
CREATE POLICY "Authenticated users can insert items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Only the person who added an item can UPDATE it
CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (auth.uid() = added_by)
  WITH CHECK (auth.uid() = added_by);

-- 4. Only the person who added an item can DELETE it
CREATE POLICY "Users can delete their own items"
  ON public.items FOR DELETE
  TO authenticated
  USING (auth.uid() = added_by);

-------------------------------------------------------------------
-- STORAGE BUCKET (Commented out setup instruction)
-------------------------------------------------------------------
/*
  Note: You will need to manually create a storage bucket in Supabase called 'item-photos'.
  Then, apply the following policies (in the Storage section or via SQL):
  
  -- Create bucket (if doing via SQL)
  -- insert into storage.buckets (id, name, public) values ('item-photos', 'item-photos', true);
  
  -- Allow public read access to photos
  -- create policy "Public view access" on storage.objects for select using ( bucket_id = 'item-photos' );
  
  -- Allow authenticated users to upload photos
  -- create policy "Authenticated insert" on storage.objects for insert to authenticated with check ( bucket_id = 'item-photos' );
*/
