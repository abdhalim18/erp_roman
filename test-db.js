const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 30);
    
    const { data, error } = await supabase
        .from('product_batches')
        .select(`
            id,
            product_id,
            quantity,
            expiry_date,
            products (name, kode_produk)
        `)
        .not('expiry_date', 'is', null)
        .gt('quantity', 0)
        .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(20);

    console.log("Error:", error);
    console.log("Data:", data);
}

test();
