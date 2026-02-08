'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  notes: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  pets?: Pet[]
}

export type Pet = {
  id: string
  customer_id: string
  name: string
  species: string
  breed: string | null
  age: number | null
  weight: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getCustomers() {
  const supabase = createAdminClient()

  // Fetch customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (customersError) {
    console.error('Error fetching customers:', customersError)
    return { customers: [], error: customersError.message }
  }

  // Fetch pets for these customers
  if (!customers || customers.length === 0) {
    return { customers: [], error: null }
  }

  const customerIds = customers.map(c => c.id)
  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select('*')
    .in('customer_id', customerIds)

  if (petsError) {
    console.error('Error fetching pets:', petsError)
    // Return customers without pets if pets fetch fails, or handle as error?
    // Let's just return customers with empty pets array to be safe
    return {
      customers: customers.map((c: any) => ({ ...c, pets: [] })),
      error: petsError.message
    }
  }

  // Merge pets into customers
  const customersWithPets = customers.map((c: any) => ({
    ...c,
    pets: pets ? pets.filter((p: any) => p.customer_id === c.id) : []
  }))

  return { customers: customersWithPets, error: null }
}

export async function createCustomer(formData: FormData) {
  const supabase = createAdminClient()

  const customer = {
    name: formData.get('name') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    zip_code: formData.get('zip_code') as string || null,
    notes: formData.get('notes') as string || null,
    status: formData.get('status') as 'active' | 'inactive',
  }

  const { error } = await supabase
    .from('customers')
    .insert([customer])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/customers')
  return { success: true, error: null }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const supabase = createAdminClient()

    const customer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      zip_code: formData.get('zip_code') as string || null,
      notes: formData.get('notes') as string || null,
      status: formData.get('status') as 'active' | 'inactive',
    }

    const { error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)

    if (error) {
      console.error('Update Customer DB Error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/customers')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Update Customer Unexpected Error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred on the server' }
  }
}

export async function deleteCustomer(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/customers')
  return { success: true, error: null }
}
