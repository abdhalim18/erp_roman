CREATE TABLE IF NOT EXISTS public.shifts (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_id     UUID         NOT NULL,
  cashier_email  TEXT         NOT NULL,
  opened_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  closed_at      TIMESTAMPTZ,
  opening_balance BIGINT      NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
  closing_balance BIGINT      CHECK (closing_balance >= 0),
  total_cash_sales    BIGINT  NOT NULL DEFAULT 0,
  total_noncash_sales BIGINT  NOT NULL DEFAULT 0,
  notes          TEXT,
  status         TEXT         NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'closed')),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index untuk pencarian shift aktif per kasir
CREATE INDEX idx_shifts_cashier_status ON public.shifts (cashier_id, status);
CREATE INDEX idx_shifts_opened_at ON public.shifts (opened_at DESC);

-- RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.shifts
  FOR ALL USING (auth.role() = 'authenticated');
