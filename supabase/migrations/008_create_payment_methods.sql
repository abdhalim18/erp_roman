CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_cash BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read operations for payment_methods" ON public.payment_methods
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Enable all access for authenticated users on payment_methods" ON public.payment_methods
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial data if empty
INSERT INTO public.payment_methods (name, is_cash, status)
SELECT 'Tunai', true, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE name = 'Tunai');

INSERT INTO public.payment_methods (name, is_cash, status)
SELECT 'Transfer Bank', false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE name = 'Transfer Bank');

INSERT INTO public.payment_methods (name, is_cash, status)
SELECT 'QRIS', false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE name = 'QRIS');

