'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Product = {
  id: string
  name: string
  description: string | null
  category_id: string | null
  category_name?: string
  kode_produk: string
  price: number
  cost: number | null
  stock: number
  min_stock: number
  unit: string
  status: 'active' | 'inactive' | 'discontinued'
  created_at: string
  updated_at: string
  earliest_expiry_date?: string | null
}

export type ProductWithCategory = Product & {
  categories: {
    id: string
    name: string
  } | null
}

export async function getProducts() {
  const supabase = createAdminClient() // ← fix: pakai adminClient, import sudah di atas

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      product_batches(expiry_date)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], error: error.message }
  }

  const products = data.map(product => {
    const batches = product.product_batches || []
    const validExpiries = batches
      .filter((b: any) => b.expiry_date !== null)
      .map((b: any) => b.expiry_date)
      .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())

    return {
      ...product,
      kode_produk: product.product_code || product.kode_produk,
      category_id: product.category_id,
      category: product.category,
      category_name: product.category?.name || 'Tidak ada kategori',
      earliest_expiry_date: validExpiries.length > 0 ? validExpiries[0] : null
    }
  })

  return { products, error: null }
}

export async function getCategoriesForSelect() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return { categories: [], error: error.message }
  }

  return { categories: data, error: null }
}

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient()
  const kode_produk = formData.get('kode_produk') as string

  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('product_code', kode_produk)
    .single()

  if (existingProduct) {
    return { success: false, error: 'Kode Produk sudah digunakan. Silakan gunakan Kode Produk yang lain.' }
  }

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') === 'none' ? null : (formData.get('category_id') as string || null),
    product_code: kode_produk,
    price: parseFloat(formData.get('price') as string),
    cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
    stock: parseInt(formData.get('stock') as string) || 0,
    min_stock: parseInt(formData.get('min_stock') as string) || 0,
    unit: formData.get('unit') as string || 'unit',
    status: formData.get('status') as 'active' | 'inactive' | 'discontinued' || 'active',
  }

  const initialStock = parseInt(formData.get('stock') as string) || 0
  const initialExpiry = formData.get('expiry_date') as string || null

  const { stock: _, ...productDataToInsert } = product

  const { data: newProductData, error } = await supabase
    .from('products')
    .insert([productDataToInsert])
    .select('id')
    .single()

  if (error) {
    if (error.message?.includes('duplicate key value') || error.message?.includes('products_sku_key')) {
      return { success: false, error: 'Kode Produk sudah digunakan. Silakan gunakan Kode Produk yang lain.' }
    }
    return { success: false, error: error.message }
  }

  if (initialStock > 0 && newProductData) {
    await supabase.from('product_batches').insert([{
      product_id: newProductData.id,
      quantity: initialStock,
      cost: product.cost,
      expiry_date: initialExpiry
    }])
  }

  revalidatePath('/admin/products')
  return { success: true, error: null }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const kode_produk = formData.get('kode_produk') as string

  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('product_code', kode_produk)
    .neq('id', id)
    .single()

  if (existingProduct) {
    return { success: false, error: 'Kode Produk sudah digunakan. Silakan gunakan Kode Produk yang lain.' }
  }

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') === 'none' ? null : (formData.get('category_id') as string || null),
    product_code: formData.get('kode_produk') as string,
    price: parseFloat(formData.get('price') as string),
    cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
    stock: parseInt(formData.get('stock') as string),
    min_stock: parseInt(formData.get('min_stock') as string),
    unit: formData.get('unit') as string || 'unit',
    status: formData.get('status') as 'active' | 'inactive' | 'discontinued',
  }

  const { stock: _, ...productDataToUpdate } = product

  const { error } = await supabase
    .from('products')
    .update(productDataToUpdate)
    .eq('id', id)

  if (error) {
    if (error.message?.includes('duplicate key value') || error.message?.includes('products_sku_key')) {
      return { success: false, error: 'Kode Produk sudah digunakan. Silakan gunakan Kode Produk yang lain.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true, error: null }
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()

  // Bug fix: Cek apakah produk masih ada di order_items aktif
  const { data: orderItems, error: checkError } = await supabase
    .from('order_items')
    .select('id, orders!inner(status)')
    .eq('product_id', id)
    .not('orders.status', 'eq', 'cancelled')
    .limit(1)

  if (checkError) {
    return { success: false, error: checkError.message }
  }

  if (orderItems && orderItems.length > 0) {
    return {
      success: false,
      error: 'Produk tidak dapat dihapus karena masih ada dalam riwayat pesanan. Nonaktifkan produk sebagai gantinya.'
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true, error: null }
}
