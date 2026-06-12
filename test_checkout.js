const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Find a product with NO expiry date and stock > 0
  const { data: products } = await supabase.from('products').select(`
    id, name, stock, price,
    product_batches(id, quantity, expiry_date)
  `);
  
  const target = products.find(p => p.stock > 0 && p.product_batches.some(b => b.expiry_date === null && b.quantity > 0));
  
  if (!target) {
     console.log("No such product found!");
     return;
  }
  
  console.log("Testing with product:", target.name);
  
  const payload = {
    p_order_number: "ORD-TEST-1",
    p_customer_id: null,
    p_total_amount: target.price * 1,
    p_payment_method: "cash",
    p_notes: "test",
    p_items: [{
      product_id: target.id,
      product_name: target.name,
      quantity: 1,
      unit_price: target.price,
      subtotal: target.price
    }]
  };
  
  const { data, error } = await supabase.rpc('create_order_transaction', payload);
  console.log("RPC Result:", data);
  console.log("RPC Error:", error);
}
main();
