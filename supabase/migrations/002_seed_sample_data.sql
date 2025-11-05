-- Insert sample products
INSERT INTO products (name, description, category, sku, price, cost, stock, min_stock, status) VALUES
('Flea & Tick Prevention', 'Monthly flea and tick prevention treatment for dogs', 'Medications', 'MED-001', 45.99, 25.00, 50, 10, 'active'),
('Dog Food - Premium', 'High-quality dry dog food, 15kg bag', 'Food', 'FOOD-001', 89.99, 50.00, 30, 5, 'active'),
('Cat Food - Grain Free', 'Grain-free wet cat food, 24-pack', 'Food', 'FOOD-002', 34.99, 18.00, 45, 10, 'active'),
('Pet Shampoo', 'Hypoallergenic pet shampoo, 500ml', 'Grooming', 'GROOM-001', 19.99, 8.00, 75, 15, 'active'),
('Dental Chews', 'Dental health chews for dogs, 30-pack', 'Treats', 'TREAT-001', 24.99, 12.00, 60, 10, 'active'),
('Heartworm Prevention', 'Monthly heartworm prevention medication', 'Medications', 'MED-002', 52.99, 28.00, 40, 10, 'active'),
('Cat Litter - Clumping', 'Premium clumping cat litter, 20kg', 'Supplies', 'SUPP-001', 29.99, 15.00, 25, 8, 'active'),
('Pet Vitamins', 'Daily multivitamin supplement for pets', 'Supplements', 'SUPP-002', 39.99, 20.00, 55, 10, 'active'),
('Nail Clippers', 'Professional pet nail clippers', 'Grooming', 'GROOM-002', 15.99, 7.00, 80, 15, 'active'),
('Pet Carrier', 'Portable pet carrier for travel', 'Accessories', 'ACC-001', 69.99, 35.00, 20, 5, 'active');

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, city, state, zip_code, status) VALUES
('John Smith', 'john.smith@email.com', '555-0101', '123 Main St', 'Springfield', 'IL', '62701', 'active'),
('Sarah Johnson', 'sarah.j@email.com', '555-0102', '456 Oak Ave', 'Springfield', 'IL', '62702', 'active'),
('Michael Brown', 'mbrown@email.com', '555-0103', '789 Pine Rd', 'Springfield', 'IL', '62703', 'active'),
('Emily Davis', 'emily.davis@email.com', '555-0104', '321 Elm St', 'Springfield', 'IL', '62704', 'active'),
('David Wilson', 'dwilson@email.com', '555-0105', '654 Maple Dr', 'Springfield', 'IL', '62705', 'active');

-- Insert sample pets
INSERT INTO pets (customer_id, name, species, breed, age, weight) VALUES
((SELECT id FROM customers WHERE email = 'john.smith@email.com'), 'Max', 'Dog', 'Golden Retriever', 5, 32.5),
((SELECT id FROM customers WHERE email = 'john.smith@email.com'), 'Bella', 'Cat', 'Siamese', 3, 4.2),
((SELECT id FROM customers WHERE email = 'sarah.j@email.com'), 'Charlie', 'Dog', 'Labrador', 2, 28.0),
((SELECT id FROM customers WHERE email = 'mbrown@email.com'), 'Luna', 'Cat', 'Persian', 4, 5.1),
((SELECT id FROM customers WHERE email = 'emily.davis@email.com'), 'Rocky', 'Dog', 'German Shepherd', 6, 35.8),
((SELECT id FROM customers WHERE email = 'dwilson@email.com'), 'Whiskers', 'Cat', 'Maine Coon', 2, 6.5);

-- Insert sample orders
INSERT INTO orders (order_number, customer_id, total_amount, discount, tax, status, payment_status, payment_method) VALUES
('ORD-2024-001', (SELECT id FROM customers WHERE email = 'john.smith@email.com'), 156.97, 0, 12.56, 'completed', 'paid', 'credit_card'),
('ORD-2024-002', (SELECT id FROM customers WHERE email = 'sarah.j@email.com'), 89.99, 5.00, 6.80, 'completed', 'paid', 'debit_card'),
('ORD-2024-003', (SELECT id FROM customers WHERE email = 'mbrown@email.com'), 74.98, 0, 6.00, 'processing', 'paid', 'credit_card'),
('ORD-2024-004', (SELECT id FROM customers WHERE email = 'emily.davis@email.com'), 45.99, 0, 3.68, 'pending', 'unpaid', NULL),
('ORD-2024-005', (SELECT id FROM customers WHERE email = 'dwilson@email.com'), 124.97, 10.00, 9.20, 'completed', 'paid', 'cash');

-- Insert sample order items for ORD-2024-001
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 
 (SELECT id FROM products WHERE sku = 'MED-001'), 
 'Flea & Tick Prevention', 2, 45.99, 91.98),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 
 (SELECT id FROM products WHERE sku = 'TREAT-001'), 
 'Dental Chews', 1, 24.99, 24.99),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 
 (SELECT id FROM products WHERE sku = 'SUPP-002'), 
 'Pet Vitamins', 1, 39.99, 39.99);

-- Insert sample order items for ORD-2024-002
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 
 (SELECT id FROM products WHERE sku = 'FOOD-001'), 
 'Dog Food - Premium', 1, 89.99, 89.99);

-- Insert sample order items for ORD-2024-003
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 
 (SELECT id FROM products WHERE sku = 'FOOD-002'), 
 'Cat Food - Grain Free', 1, 34.99, 34.99),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 
 (SELECT id FROM products WHERE sku = 'SUPP-001'), 
 'Cat Litter - Clumping', 1, 29.99, 29.99),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 
 (SELECT id FROM products WHERE sku = 'GROOM-001'), 
 'Pet Shampoo', 1, 19.99, 19.99);

-- Insert sample order items for ORD-2024-004
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 
 (SELECT id FROM products WHERE sku = 'MED-001'), 
 'Flea & Tick Prevention', 1, 45.99, 45.99);

-- Insert sample order items for ORD-2024-005
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 
 (SELECT id FROM products WHERE sku = 'MED-002'), 
 'Heartworm Prevention', 1, 52.99, 52.99),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 
 (SELECT id FROM products WHERE sku = 'ACC-001'), 
 'Pet Carrier', 1, 69.99, 69.99);
