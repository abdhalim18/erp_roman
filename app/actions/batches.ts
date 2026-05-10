'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export type ProductBatch = {
  id: string
  product_id: string
  quantity: number
  cost: number | null
  expiry_date: string | null
  purchase_date: string | null
  supplier_id: string | null
  suppliers?: { name: string } | null
  created_at: string
  updated_at: string
}

export async function getProductBatches(productId: string): Promise<{ batches: ProductBatch[]; error: string | null }> {
  noStore()
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('product_batches')
    .select('*, suppliers(name)')
    .eq('product_id', productId)
    .filter('quantity', 'gt', 0)
    .order('expiry_date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching product batches:', error)
    return { batches: [], error: error.message }
  }

  return { batches: data as ProductBatch[], error: null }
}

export async function addProductBatch(formData: FormData): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  
  const productId = formData.get('product_id') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null
  const expiryDate = formData.get('expiry_date') as string || null
  const purchaseDate = formData.get('purchase_date') as string || null
  const supplierId = formData.get('supplier_id') as string || null

  if (!productId || isNaN(quantity) || quantity <= 0 || !expiryDate) {
    return { success: false, error: 'Product ID, valid quantity, or expiry date is missing' }
  }

  const batch = {
    product_id: productId,
    quantity,
    cost,
    expiry_date: expiryDate,
    purchase_date: purchaseDate,
    supplier_id: supplierId || null
  }

  const { error } = await supabase
    .from('product_batches')
    .insert([batch])

  if (error) {
    console.error('Error adding batch:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}/batches`)
  return { success: true, error: null }
}

export async function adjustBatchQuantity(batchId: string, productId: string, newQuantity: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  
  if (newQuantity < 0) {
     return { success: false, error: 'Quantity cannot be negative' }
  }

  const { error } = await supabase
    .from('product_batches')
    .update({ quantity: newQuantity })
    .eq('id', batchId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}/batches`)
  return { success: true, error: null }
}

export async function editProductBatch(formData: FormData): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  
  const batchId = formData.get('batch_id') as string
  const productId = formData.get('product_id') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null
  const expiryDate = formData.get('expiry_date') as string || null
  const purchaseDate = formData.get('purchase_date') as string || null
  const supplierId = formData.get('supplier_id') as string || null

  if (!batchId || !productId || isNaN(quantity) || quantity < 0 || !expiryDate) {
    return { success: false, error: 'Terdapat data yang tidak valid, pastikan semua kolom yang diperlukan terisi' }
  }

  const { error } = await supabase
    .from('product_batches')
    .update({ 
      quantity, 
      cost, 
      expiry_date: expiryDate,
      purchase_date: purchaseDate,
      supplier_id: supplierId || null
    })
    .eq('id', batchId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}/batches`)
  return { success: true, error: null }
}

export async function deleteProductBatch(batchId: string, productId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()

  // Pastikan batch id valid
  if (!batchId) return { success: false, error: 'Batch ID kosong' }

  // Cek apakah batch ini sudah terpaut dengan riwayat pesanan
  // Note: karena RLS / foreign key on delete restrict/cascade ini bisa error.
  const { error } = await supabase
    .from('product_batches')
    .delete()
    .eq('id', batchId)

  if (error) {
    // Return friendly error kalau nabrak constraint (contoh: sudah pernah dijual)
    if (error.code === '23503') {
       return { success: false, error: 'Tidak bisa menghapus Batch yang sudah pernah digunakan dalam transaksi.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}/batches`)
  return { success: true, error: null }
}
