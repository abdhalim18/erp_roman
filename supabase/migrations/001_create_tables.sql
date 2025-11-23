-- ===========================================
-- 🧩 INITIAL SETUP
-- ===========================================

-- Enable UUID and crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- Ensure permissions and schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO public;
SET search_path TO public;

-- ===========================================
-- 🧨 DROP EXISTING TABLES (reverse dependency order)
-- ===========================================
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- ===========================================
-- 🧱 CORE TABLES
-- ===========================================

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sku TEXT UNIQUE NOT NULL,
  price BIGINT NOT NULL CHECK (price >= 0) DEFAULT 0,
  cost BIGINT CHECK (cost >= 0) DEFAULT 0,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'unit',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  total_amount BIGINT NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  discount BIGINT DEFAULT 0 CHECK (discount >= 0),
  tax BIGINT DEFAULT 0 CHECK (tax >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ⚙️ FUNCTIONS & TRIGGERS
-- ===========================================

-- Function to auto-update "updated_at"
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto "updated_at"
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- 🧰 INDEXES
-- ===========================================
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ===========================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON public.customers
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.orders
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ===========================================
-- 🌱 SAMPLE DATA
-- ===========================================

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Medications', 'Prescription and over-the-counter medications for pets'),
('Food', 'Pet food and nutrition products'),
('Grooming', 'Pet grooming supplies and tools'),
('Treats', 'Pet treats and chews'),
('Supplies', 'General pet care supplies'),
('Accessories', 'Pet accessories and travel gear')
ON CONFLICT (name) DO NOTHING;

-- Insert products
INSERT INTO products (name, description, category_id, sku, price, cost, stock, min_stock, status) VALUES
('Flea & Tick Prevention', 'Monthly flea and tick prevention treatment for dogs', (SELECT id FROM categories WHERE name = 'Medications'), 'MED-001', 459900, 250000, 50, 10, 'active'),
('Dog Food - Premium', 'High-quality dry dog food, 15kg bag', (SELECT id FROM categories WHERE name = 'Food'), 'FOOD-001', 899900, 500000, 30, 5, 'active'),
('Cat Food - Grain Free', 'Grain-free wet cat food, 24-pack', (SELECT id FROM categories WHERE name = 'Food'), 'FOOD-002', 349900, 180000, 45, 10, 'active'),
('Pet Shampoo', 'Hypoallergenic pet shampoo, 500ml', (SELECT id FROM categories WHERE name = 'Grooming'), 'GROOM-001', 199900, 80000, 75, 15, 'active'),
('Dental Chews', 'Dental health chews for dogs, 30-pack', (SELECT id FROM categories WHERE name = 'Treats'), 'TREAT-001', 249900, 120000, 60, 10, 'active'),
('Heartworm Prevention', 'Monthly heartworm prevention medication', (SELECT id FROM categories WHERE name = 'Medications'), 'MED-002', 529900, 280000, 40, 10, 'active'),
('Cat Litter - Clumping', 'Premium clumping cat litter, 20kg', (SELECT id FROM categories WHERE name = 'Supplies'), 'SUPP-001', 299900, 150000, 25, 8, 'active'),
('Pet Vitamins', 'Daily multivitamin supplement for pets', (SELECT id FROM categories WHERE name = 'Supplies'), 'SUPP-002', 399900, 200000, 55, 10, 'active'),
('Nail Clippers', 'Professional pet nail clippers', (SELECT id FROM categories WHERE name = 'Grooming'), 'GROOM-002', 159900, 70000, 80, 15, 'active'),
('Pet Carrier', 'Portable pet carrier for travel', (SELECT id FROM categories WHERE name = 'Accessories'), 'ACC-001', 699900, 350000, 20, 5, 'active')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  stock = EXCLUDED.stock,
  min_stock = EXCLUDED.min_stock,
  status = EXCLUDED.status;

-- Insert customers
INSERT INTO customers (name, email, phone, address, city, state, zip_code, status) VALUES
('John Smith', 'john.smith@email.com', '555-0101', '123 Main St', 'Springfield', 'IL', '62701', 'active'),
('Sarah Johnson', 'sarah.j@email.com', '555-0102', '456 Oak Ave', 'Springfield', 'IL', '62702', 'active'),
('Michael Brown', 'mbrown@email.com', '555-0103', '789 Pine Rd', 'Springfield', 'IL', '62703', 'active'),
('Emily Davis', 'emily.davis@email.com', '555-0104', '321 Elm St', 'Springfield', 'IL', '62704', 'active'),
('David Wilson', 'dwilson@email.com', '555-0105', '654 Maple Dr', 'Springfield', 'IL', '62705', 'active');

-- Insert orders
INSERT INTO orders (order_number, customer_id, total_amount, discount, tax, status, payment_status, payment_method) VALUES
('ORD-2024-001', (SELECT id FROM customers WHERE email = 'john.smith@email.com'), 899900, 0, 0, 'completed', 'paid', 'card'),
('ORD-2024-002', (SELECT id FROM customers WHERE email = 'sarah.j@email.com'), 349900, 0, 0, 'completed', 'paid', 'transfer'),
('ORD-2024-003', (SELECT id FROM customers WHERE email = 'mike.w@email.com'), 249900, 50000, 0, 'completed', 'paid', 'cash'),
('ORD-2024-004', (SELECT id FROM customers WHERE email = 'lisa.b@email.com'), 1999600, 100000, 152000, 'processing', 'partial', 'card'),
('ORD-2024-005', (SELECT id FROM customers WHERE email = 'dwilson@email.com'), 1249700, 100000, 92000, 'completed', 'paid', 'cash');

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
-- Order 1
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), (SELECT id FROM products WHERE sku = 'FOOD-001'), 'Dog Food - Premium', 1, 899900, 899900),
-- Order 2
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), (SELECT id FROM products WHERE sku = 'FOOD-002'), 'Cat Food - Grain Free', 1, 349900, 349900),
-- Order 3
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), (SELECT id FROM products WHERE sku = 'TREAT-001'), 'Dental Chews', 1, 299900, 299900),
-- Order 4
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE sku = 'GROOM-001'), 'Pet Shampoo', 2, 199900, 399800),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE sku = 'MED-001'), 'Flea & Tick Prevention', 1, 459900, 459900),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE sku = 'MED-002'), 'Heartworm Prevention', 1, 529900, 529900),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE sku = 'SUPP-001'), 'Cat Litter - Clumping', 1, 299900, 299900),
-- Order 5
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), (SELECT id FROM products WHERE sku = 'FOOD-001'), 'Dog Food - Premium', 1, 899900, 899900),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), (SELECT id FROM products WHERE sku = 'TREAT-001'), 'Dental Chews', 1, 299900, 299900);
