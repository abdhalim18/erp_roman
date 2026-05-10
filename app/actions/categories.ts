'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Category = {
  id: string
  name: string
  description: string | null
  status?: 'active' | 'inactive'
  created_at: string
  updated_at: string
  product_count?: number
}

export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('name', { ascending: true })

  if (error) {
    return { categories: [], error: error.message }
  }
  
  const categoriesWithCount = data.map((cat: any) => ({
    ...cat,
    product_count: cat.products && cat.products.length > 0 ? cat.products[0].count : 0
  })) as Category[]
  
  return { categories: categoriesWithCount, error: null }
}

export async function getCategory(id: string): Promise<{ category: Category | null; error: string | null }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { category: null, error: error.message }
  }
  return { category: data as Category, error: null }
}

export async function createCategory(formData: FormData): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('categories')
    .insert([{
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      status: formData.get('status') as string || 'active'
    }])

  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/categories')
  return { success: true, error: null }
}

export async function updateCategory(id: string, formData: FormData): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      status: formData.get('status') as string || 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/categories')
  return { success: true, error: null }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    
  if (countError) {
    return { success: false, error: countError.message }
  }
  
  if (count && count > 0) {
    return { success: false, error: 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/categories')
  return { success: true, error: null }
}
