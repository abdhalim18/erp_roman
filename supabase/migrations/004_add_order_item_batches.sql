-- Migration: 004_add_order_item_batches
-- Description: Create link table to track batch deductions for order items

-- Create order_item_batches table
CREATE TABLE IF NOT EXISTS public.order_item_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.product_batches(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_item_batches ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Allow all read operations for order_item_batches" ON public.order_item_batches
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow all insert operations for order_item_batches" ON public.order_item_batches
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow all update operations for order_item_batches" ON public.order_item_batches
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Allow all delete operations for order_item_batches" ON public.order_item_batches
    FOR DELETE TO public
    USING (true);

-- Indexes for performance
CREATE INDEX idx_order_item_batches_order_item_id ON public.order_item_batches(order_item_id);
CREATE INDEX idx_order_item_batches_batch_id ON public.order_item_batches(batch_id);
