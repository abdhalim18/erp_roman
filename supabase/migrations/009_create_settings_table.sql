-- Migration: 009_create_settings_table
-- Description: Create settings table to store application configurations

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL DEFAULT 'Toko Roman',
    store_address TEXT,
    store_phone TEXT,
    low_stock_threshold INTEGER NOT NULL DEFAULT 8,
    alert_email_recipient TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings (often needed for login/header)
CREATE POLICY "Allow all read operations for settings" ON public.settings
    FOR SELECT TO public
    USING (true);

-- Allow authenticated users (admins/cashiers) to modify settings
CREATE POLICY "Enable all access for authenticated users on settings" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated');
