import { createAdminClient } from '@/lib/supabase/admin'
import { getProductBatches } from '@/app/actions/batches'
import { notFound } from 'next/navigation'
import { BatchesClient } from './batches-client'

export default async function ProductBatchesPage({ params }: { params: { id: string } }) {
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

  return <BatchesClient product={product} initialBatches={batches || []} />
}
