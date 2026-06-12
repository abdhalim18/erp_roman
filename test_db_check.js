const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products } = await supabase.from('products').select(`
    id, name, stock,
    product_batches(quantity, expiry_date)
  `);
  
  const mismatch = products.filter(p => {
    const batchSum = (p.product_batches || []).reduce((sum, b) => sum + b.quantity, 0);
    return batchSum !== p.stock && p.stock > 0;
  });
  
  console.log("Mismatched Products count:", mismatch.length);
  if (mismatch.length > 0) {
     console.log("First mismatch:", mismatch[0]);
  }
}
main();
