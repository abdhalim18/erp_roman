const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products } = await supabase.from('products').select(`
    id, name, stock,
    product_batches(quantity, expiry_date)
  `);
  
  const thresholdDate = new Date();
  thresholdDate.setHours(0, 0, 0, 0);
  thresholdDate.setDate(thresholdDate.getDate() + 14);

  const problemProducts = products.filter(product => {
    const batches = product.product_batches || [];
    let sellable_stock = 0;
    batches.forEach(b => {
       const isSellable = !b.expiry_date || new Date(b.expiry_date) > thresholdDate;
       if (isSellable) {
         sellable_stock += (b.quantity || 0);
       }
    });
    
    // Condition: the user says "tidak ada expired jadi tidak bisa di checkout"
    // So sellable_stock is 0, but stock > 0, and they think it shouldn't be expired.
    return sellable_stock === 0 && product.stock > 0;
  });
  
  console.log("Problem products count:", problemProducts.length);
  if (problemProducts.length > 0) {
      console.log("Example:", JSON.stringify(problemProducts[0], null, 2));
  }
}
main();
