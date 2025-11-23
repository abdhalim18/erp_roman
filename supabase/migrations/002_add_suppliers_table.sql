-- Add suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  tax_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add supplier_id to products table
ALTER TABLE public.products 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);

-- Enable RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Enable read access for all users" ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.suppliers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.suppliers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for admin users" ON public.suppliers
  FOR DELETE USING (auth.role() = 'authenticated');
