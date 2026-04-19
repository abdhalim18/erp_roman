CREATE OR REPLACE FUNCTION public.create_order_transaction(
  p_order_number     TEXT,
  p_customer_id      UUID,
  p_total_amount     BIGINT,
  p_payment_method   TEXT,
  p_notes            TEXT,
  p_items            JSONB  -- array of {product_id, product_name, quantity, unit_price, subtotal}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id       UUID;
  v_item           JSONB;
  v_order_item_id  UUID;
  v_batch          RECORD;
  v_remaining      INTEGER;
  v_deduct         INTEGER;
BEGIN
  -- 1. Insert order
  INSERT INTO public.orders (
    order_number, customer_id, total_amount, discount, tax,
    status, payment_status, payment_method, notes
  )
  VALUES (
    p_order_number, p_customer_id, p_total_amount, 0, 0,
    'completed', 'paid', p_payment_method, p_notes
  )
  RETURNING id INTO v_order_id;

  -- 2. Proses setiap item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Insert order_item
    INSERT INTO public.order_items (
      order_id, product_id, product_name, quantity, unit_price, subtotal
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::BIGINT,
      (v_item->>'subtotal')::BIGINT
    )
    RETURNING id INTO v_order_item_id;

    -- 3. FEFO batch deduction
    v_remaining := (v_item->>'quantity')::INTEGER;

    FOR v_batch IN
      SELECT id, quantity
      FROM public.product_batches
      WHERE product_id = (v_item->>'product_id')::UUID
        AND quantity > 0
      ORDER BY expiry_date ASC NULLS LAST
    LOOP
      EXIT WHEN v_remaining <= 0;

      v_deduct := LEAST(v_batch.quantity, v_remaining);

      UPDATE public.product_batches
      SET quantity = quantity - v_deduct
      WHERE id = v_batch.id;

      INSERT INTO public.order_item_batches (order_item_id, batch_id, quantity)
      VALUES (v_order_item_id, v_batch.id, v_deduct);

      v_remaining := v_remaining - v_deduct;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', p_order_number
  );

EXCEPTION WHEN OTHERS THEN
  -- Jika ada error, Postgres otomatis melakukan ROLLBACK seluruh transaksi
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute access ke authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_transaction TO service_role;
