-- ==========================================
-- 🌱 SEED DATA FOR TOKO ROMAN
-- ==========================================

-- 1. Insert Categories
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Men and Women apparel'),
('Groceries', 'Daily needs and food items'),
('Stationery', 'Office and school supplies'),
('Furniture', 'Home and office furniture')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, city, state, zip_code, status) VALUES
('Global Electronics Ltd', 'John Doe', 'contact@globalelectronics.com', '1234567890', '123 Tech Park', 'Jakarta', 'DKI Jakarta', '10110', 'active'),
('Fashion Wholesale', 'Jane Smith', 'sales@fashionwholesale.com', '0987654321', '456 Fashion Blvd', 'Bandung', 'Jawa Barat', '40111', 'active'),
('City Grocers', 'Budi Santoso', 'info@citygrocers.com', '1122334455', '789 Market St', 'Surabaya', 'Jawa Timur', '60111', 'active'),
('Office Supplies Co', 'Agus Setiawan', 'support@officesupplies.com', '9988776655', '321 Office Ave', 'Semarang', 'Jawa Tengah', '50111', 'active'),
('Home Decor Inc', 'Linda Wijaya', 'hello@homedecor.com', '5544332211', '654 Furniture Rd', 'Yogyakarta', 'DIY', '55111', 'active')
ON CONFLICT DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (name, description, category_id, supplier_id, kode_produk, price, cost, stock, min_stock, unit, status) VALUES
('Smartphone X', 'Latest smartphone model', (SELECT id FROM public.categories WHERE name = 'Electronics'), (SELECT id FROM public.suppliers WHERE name = 'Global Electronics Ltd'), 'ELEC-001', 5000000, 4000000, 50, 10, 'pcs', 'active'),
('Laptop Pro', 'High performance laptop', (SELECT id FROM public.categories WHERE name = 'Electronics'), (SELECT id FROM public.suppliers WHERE name = 'Global Electronics Ltd'), 'ELEC-002', 15000000, 12000000, 30, 5, 'pcs', 'active'),
('Cotton T-Shirt', 'Comfortable cotton t-shirt', (SELECT id FROM public.categories WHERE name = 'Clothing'), (SELECT id FROM public.suppliers WHERE name = 'Fashion Wholesale'), 'CLOT-001', 100000, 50000, 200, 20, 'pcs', 'active'),
('Denim Jeans', 'Classic blue denim jeans', (SELECT id FROM public.categories WHERE name = 'Clothing'), (SELECT id FROM public.suppliers WHERE name = 'Fashion Wholesale'), 'CLOT-002', 300000, 150000, 150, 15, 'pcs', 'active'),
('Premium Rice 5kg', 'High quality white rice', (SELECT id FROM public.categories WHERE name = 'Groceries'), (SELECT id FROM public.suppliers WHERE name = 'City Grocers'), 'GROC-001', 75000, 60000, 100, 10, 'pack', 'active'),
('Wheat Bread', 'Fresh wheat bread', (SELECT id FROM public.categories WHERE name = 'Groceries'), (SELECT id FROM public.suppliers WHERE name = 'City Grocers'), 'GROC-002', 20000, 15000, 50, 5, 'pcs', 'active'),
('A4 Notebook', 'Spiral notebook 100 pages', (SELECT id FROM public.categories WHERE name = 'Stationery'), (SELECT id FROM public.suppliers WHERE name = 'Office Supplies Co'), 'STAT-001', 15000, 10000, 300, 50, 'pcs', 'active'),
('Ballpoint Pen Set', 'Set of 10 black pens', (SELECT id FROM public.categories WHERE name = 'Stationery'), (SELECT id FROM public.suppliers WHERE name = 'Office Supplies Co'), 'STAT-002', 25000, 15000, 200, 20, 'pack', 'active'),
('Office Chair', 'Ergonomic office chair', (SELECT id FROM public.categories WHERE name = 'Furniture'), (SELECT id FROM public.suppliers WHERE name = 'Home Decor Inc'), 'FURN-001', 1200000, 900000, 40, 5, 'pcs', 'active'),
('Wooden Desk', 'Minimalist wooden desk', (SELECT id FROM public.categories WHERE name = 'Furniture'), (SELECT id FROM public.suppliers WHERE name = 'Home Decor Inc'), 'FURN-002', 2000000, 1500000, 20, 2, 'pcs', 'active')
ON CONFLICT (kode_produk) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  supplier_id = EXCLUDED.supplier_id,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  stock = EXCLUDED.stock,
  min_stock = EXCLUDED.min_stock,
  unit = EXCLUDED.unit,
  status = EXCLUDED.status;

-- 4. Insert Customers
INSERT INTO public.customers (name, email, phone, address, city, state, zip_code, status) VALUES
('Arif Rahman', 'arif@example.com', '081234567890', 'Jalan Sudirman No 1', 'Jakarta', 'DKI Jakarta', '10220', 'active'),
('Siti Aminah', 'siti@example.com', '081987654321', 'Jalan Thamrin No 2', 'Jakarta', 'DKI Jakarta', '10230', 'active'),
('Reza Pahlevi', 'reza@example.com', '081555666777', 'Jalan Merdeka No 3', 'Bandung', 'Jawa Barat', '40112', 'active'),
('Dewi Lestari', 'dewi@example.com', '081222333444', 'Jalan Diponegoro No 4', 'Surabaya', 'Jawa Timur', '60112', 'active'),
('Hendra Gunawan', 'hendra@example.com', '081111222333', 'Jalan Pahlawan No 5', 'Semarang', 'Jawa Tengah', '50112', 'active')
ON CONFLICT (email) DO NOTHING;

-- 5. Insert Orders
INSERT INTO public.orders (order_number, customer_id, total_amount, discount, tax, status, payment_status, payment_method) VALUES
('ORD-TEST-001', (SELECT id FROM public.customers WHERE email = 'arif@example.com'), 5100000, 0, 100000, 'completed', 'paid', 'transfer'),
('ORD-TEST-002', (SELECT id FROM public.customers WHERE email = 'siti@example.com'), 300000, 0, 0, 'completed', 'paid', 'cash'),
('ORD-TEST-003', (SELECT id FROM public.customers WHERE email = 'reza@example.com'), 95000, 0, 0, 'processing', 'unpaid', 'cash'),
('ORD-TEST-004', (SELECT id FROM public.customers WHERE email = 'dewi@example.com'), 1200000, 0, 0, 'completed', 'paid', 'card'),
('ORD-TEST-005', (SELECT id FROM public.customers WHERE email = 'hendra@example.com'), 15000000, 500000, 500000, 'completed', 'paid', 'transfer')
ON CONFLICT (order_number) DO NOTHING;

-- 6. Insert Order Items (only if they don't exist to prevent duplicates on multiple seeds)
-- We will just insert them, as seed files are usually run on empty DBs or fresh resets.
-- For safety, we can delete existing ones for these test orders or just append.
-- Let's delete existing test order items to be safe if running multiple times without reset.
DELETE FROM public.order_items WHERE order_id IN (
    SELECT id FROM public.orders WHERE order_number IN ('ORD-TEST-001', 'ORD-TEST-002', 'ORD-TEST-003', 'ORD-TEST-004', 'ORD-TEST-005')
);

INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
-- Order 1: Arif (Smartphone X + Cotton T-Shirt)
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-001'), (SELECT id FROM public.products WHERE kode_produk = 'ELEC-001'), 'Smartphone X', 1, 5000000, 5000000),
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-001'), (SELECT id FROM public.products WHERE kode_produk = 'CLOT-001'), 'Cotton T-Shirt', 1, 100000, 100000),

-- Order 2: Siti (Denim Jeans)
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-002'), (SELECT id FROM public.products WHERE kode_produk = 'CLOT-002'), 'Denim Jeans', 1, 300000, 300000),

-- Order 3: Reza (Premium Rice + Wheat Bread)
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-003'), (SELECT id FROM public.products WHERE kode_produk = 'GROC-001'), 'Premium Rice 5kg', 1, 75000, 75000),
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-003'), (SELECT id FROM public.products WHERE kode_produk = 'GROC-002'), 'Wheat Bread', 1, 20000, 20000),

-- Order 4: Dewi (Office Chair)
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-004'), (SELECT id FROM public.products WHERE kode_produk = 'FURN-001'), 'Office Chair', 1, 1200000, 1200000),

-- Order 5: Hendra (Laptop Pro)
((SELECT id FROM public.orders WHERE order_number = 'ORD-TEST-005'), (SELECT id FROM public.products WHERE kode_produk = 'ELEC-002'), 'Laptop Pro', 1, 15000000, 15000000);

