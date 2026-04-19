import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data, error } = await supabase.from('products').select('id, categories(id, name)').limit(2)
  console.log('Error:', error)
  console.log('Data:', JSON.stringify(data, null, 2))
}

run()
