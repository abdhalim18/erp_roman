INSERT INTO public.product_batches (product_id, quantity, expiry_date, cost)
SELECT p.id, p.stock, NULL, p.cost
FROM public.products p
LEFT JOIN public.product_batches pb ON p.id = pb.product_id
WHERE pb.id IS NULL AND p.stock > 0;
