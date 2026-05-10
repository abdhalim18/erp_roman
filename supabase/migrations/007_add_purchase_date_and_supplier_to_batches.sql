-- Add purchase_date and supplier_id to product_batches
ALTER TABLE public.product_batches
ADD COLUMN purchase_date DATE,
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Create an index on supplier_id for faster lookups
CREATE INDEX idx_product_batches_supplier_id ON public.product_batches(supplier_id);
