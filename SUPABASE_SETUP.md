# Supabase Database Setup Guide

This guide will help you set up the database tables for your VetMed ERP system in Supabase.

## 🚀 Quick Setup (Recommended)

### Step 1: Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### Step 2: Link Your Project

```bash
supabase link --project-ref wcwaazrvtwsekuprznib
```

You'll be prompted for your database password.

### Step 3: Push Migrations

```bash
supabase db push
```

This will create all tables, indexes, triggers, and RLS policies automatically!

### Step 4: Install Frontend Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-select
```

### Step 5: Start Your App

```bash
npm run dev
```

✅ **Done!** Your database is set up and your app is ready to use!

## 🔧 Supabase CLI Commands

Here are some useful Supabase CLI commands for managing your project:

### Link your project
```bash
supabase link --project-ref wcwaazrvtwsekuprznib
```

### Create a new migration
```bash
supabase migration new new-migration
```

### Run all migrations against this project
```bash
supabase db push
```

---

## 📋 Database Schema Overview

The database consists of 4 main tables:

1. **customers** - Store customer information
2. **products** - Store product inventory
3. **orders** - Store order headers
4. **order_items** - Store individual items in each order

## 🌐 Alternative: Manual Setup via Dashboard

If you prefer not to use the CLI:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `wcwaazrvtwsekuprznib`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Main Migration

1. Open the file: `supabase/migrations/001_create_tables.sql`
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

This will create:
- ✅ All 5 database tables
- ✅ Indexes for better performance
- ✅ Automatic `updated_at` triggers
- ✅ Row Level Security (RLS) policies
- ✅ Foreign key relationships

### Step 3: Add Sample Data (Optional)

1. Open the file: `supabase/migrations/002_seed_sample_data.sql`
2. Copy all the SQL code
3. Paste it into a new query in Supabase SQL Editor
4. Click **Run**

This will insert:
- 10 sample products
- 5 sample customers
- 6 sample pets
- 5 sample orders with items

### Step 4: Install Frontend Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-select
```

### Step 5: Verify the Setup

1. In Supabase, go to **Table Editor**
2. You should see these tables:
   - customers
   - pets
   - products
   - orders
   - order_items

3. Click on each table to view the sample data

## 📊 Database Schema Details

### Customers Table
```sql
- id (UUID, Primary Key)
- name (Text, Required)
- email (Text, Unique)
- phone (Text)
- address, city, state, zip_code (Text)
- notes (Text)
- status (active/inactive)
- created_at, updated_at (Timestamp)
```

### Pets Table
```sql
- id (UUID, Primary Key)
- customer_id (UUID, Foreign Key → customers)
- name (Text, Required)
- species (Text, Required)
- breed (Text)
- age (Integer)
- weight (Decimal)
- notes (Text)
- created_at, updated_at (Timestamp)
```

### Products Table
```sql
- id (UUID, Primary Key)
- name (Text, Required)
- description (Text)
- category (Text, Required)
- sku (Text, Unique, Required)
- price (Decimal, Required)
- cost (Decimal)
- stock (Integer)
- min_stock (Integer)
- unit (Text)
- status (active/inactive/discontinued)
- created_at, updated_at (Timestamp)
```

### Orders Table
```sql
- id (UUID, Primary Key)
- order_number (Text, Unique, Required)
- customer_id (UUID, Foreign Key → customers)
- total_amount (Decimal, Required)
- discount (Decimal)
- tax (Decimal)
- status (pending/processing/completed/cancelled)
- payment_status (unpaid/partial/paid/refunded)
- payment_method (Text)
- notes (Text)
- created_at, updated_at (Timestamp)
```

### Order Items Table
```sql
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key → orders)
- product_id (UUID, Foreign Key → products)
- product_name (Text, Required)
- quantity (Integer, Required)
- unit_price (Decimal, Required)
- subtotal (Decimal, Required)
- created_at (Timestamp)
```

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that allow:
- ✅ Full access for authenticated users (admins)
- ❌ No access for unauthenticated users

### Data Integrity
- Foreign key constraints ensure data consistency
- Check constraints validate data (e.g., price >= 0, stock >= 0)
- Unique constraints prevent duplicates (email, SKU, order_number)
- Automatic timestamps with triggers

## 🔍 Testing the Database

### Test Query 1: View All Products
```sql
SELECT * FROM products ORDER BY created_at DESC;
```

### Test Query 2: View Customers and Their Orders
```sql
SELECT 
  c.name as customer_name,
  c.email,
  c.phone,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email, c.phone
ORDER BY c.name;
```

### Test Query 3: View Orders with Customer Details
```sql
SELECT 
  o.order_number,
  c.name as customer_name,
  o.total_amount,
  o.status,
  o.created_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;
```

### Test Query 4: View Order Items with Product Details
```sql
SELECT 
  oi.id as item_id,
  o.order_number,
  p.name as product_name,
  oi.quantity,
  oi.unit_price,
  oi.subtotal
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id
ORDER BY o.created_at DESC, oi.id;
```

### Test Query 5: View Low Stock Products
```sql
SELECT 
  name,
  sku,
  stock,
  min_stock
FROM products
WHERE stock <= min_stock
ORDER BY stock ASC;
```

## 📈 Next Steps

After setting up the database:

1. **Test the connection** - Run your Next.js app and verify it connects to Supabase
2. **Create API routes** - Build server actions to fetch and manipulate data
3. **Update the UI** - Connect the Products, Customers, and Orders pages to real data
4. **Add CRUD operations** - Implement Create, Read, Update, Delete functionality

## 👤 Setting Up Your First Admin User

To log in to your application, you'll need to create an admin user in Supabase:

1. Go to the [Supabase Authentication Users](https://supabase.com/dashboard/project/wcwaazrvtwsekuprznib/auth/users) page
   - Replace `wcwaazrvtwsekuprznib` with your actual project ID if different

2. Click the **Invite User** button
   - Enter the admin email address
   - Click **Invite**

3. The user will receive an invitation email
   - Click the **Accept Invite** link in the email
   - Set a strong password
   - Complete the sign-up process

4. (Optional) Make the user an admin
   - Go back to the Users page
   - Find the user and click the three dots (⋮)
   - Select **Edit User**
   - Under **User Metadata**, add: `{ "role": "admin" }`
   - Click **Save**

5. Test the login
   - Go to your app's login page
   - Enter the email and password you just set up
   - You should be successfully logged in

## 🆘 Troubleshooting

### Issue: "Cannot find project ref. Have you run supabase link?"
**Solution:** Run `supabase link --project-ref wcwaazrvtwsekuprznib`

### Issue: "relation already exists"
**Solution:** The tables are already created! This is good - your database is set up. Just install the npm dependencies and start your app:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select
npm run dev
```

### Issue: "permission denied"
**Solution:** Make sure you're logged in as the project owner in Supabase

### Issue: Foreign key constraint violation
**Solution:** Make sure to run migrations in order (001 before 002)

### Issue: "Cannot find module '@radix-ui/react-dialog'"
**Solution:** Install the required dependencies:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select
```

## 📚 Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

✅ Once you've completed these steps, your database will be ready to use with your VetMed ERP application!
