const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products } = await supabase.from('products').select('id, name, stock').limit(5);
  const { data: batches } = await supabase.from('product_batches').select('*').limit(5);
  console.log("Products:", products);
  console.log("Batches:", batches);
}
main();
