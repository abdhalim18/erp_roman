const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products } = await supabase.from('products').select(`
    id, name, stock, cost,
    product_batches(id)
  `);
  
  const mismatch = products.filter(p => (p.product_batches || []).length === 0 && p.stock > 0);
  
  console.log(`Found ${mismatch.length} products to fix.`);
  
  for (const p of mismatch) {
    const { error } = await supabase.from('product_batches').insert([{
      product_id: p.id,
      quantity: p.stock,
      cost: p.cost,
      expiry_date: null
    }]);
    if (error) {
      console.error("Error inserting for", p.name, error.message);
    }
  }
  console.log("Done fixing.");
}
main();
