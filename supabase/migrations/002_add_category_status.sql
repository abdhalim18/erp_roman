ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
