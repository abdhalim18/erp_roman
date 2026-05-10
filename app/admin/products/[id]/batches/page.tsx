import { createAdminClient } from '@/lib/supabase/admin'
import { getProductBatches } from '@/app/actions/batches'
import { notFound } from 'next/navigation'
import { BatchesClient } from './batches-client'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function ProductBatchesPage({ params }: { params: { id: string } }) {
  noStore()
  const supabase = createAdminClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories (name)')
    .eq('id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const { batches } = await getProductBatches(params.id)
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').order('name')

  return <BatchesClient product={product} initialBatches={batches || []} suppliers={suppliers || []} />
}
