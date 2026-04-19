-- 1. Create product_batches table
CREATE TABLE public.product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  cost BIGINT CHECK (cost >= 0) DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS Policies
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.product_batches
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Trigger updated_at
CREATE TRIGGER update_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger to maintain products.stock based on batches
CREATE OR REPLACE FUNCTION public.update_product_stock_from_batches()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET stock = COALESCE((SELECT SUM(quantity) FROM public.product_batches WHERE product_id = OLD.product_id), 0)
    WHERE id = OLD.product_id;
    RETURN OLD;
  ELSE
    UPDATE public.products
    SET stock = COALESCE((SELECT SUM(quantity) FROM public.product_batches WHERE product_id = NEW.product_id), 0)
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_product_stock
  AFTER INSERT OR UPDATE OR DELETE ON public.product_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_stock_from_batches();

-- 5. Data Migration: move current stock to batches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='expiry_date') THEN
    EXECUTE 'INSERT INTO public.product_batches (product_id, quantity, cost, expiry_date) SELECT id, stock, cost, CAST(expiry_date AS DATE) FROM public.products WHERE stock > 0';
    EXECUTE 'ALTER TABLE public.products DROP COLUMN expiry_date';
  ELSE
    EXECUTE 'INSERT INTO public.product_batches (product_id, quantity, cost) SELECT id, stock, cost FROM public.products WHERE stock > 0';
  END IF;
END
$$;
