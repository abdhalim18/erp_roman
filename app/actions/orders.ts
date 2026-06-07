'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendLowStockEmail } from '@/lib/email'

export type Order = {
  id: string
  order_number: string
  customer_id: string | null
  total_amount: number
  discount: number
  tax: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export type CreateOrderItemInput = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount?: number
}

export type CreateOrderPayload = {
  customer_id?: string | null
  payment_method: string
  items: CreateOrderItemInput[]
  notes?: string
}

export async function getOrders() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        email
      ),
      order_items (
        *,
        products (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], error: error.message }
  }

  return { orders: data, error: null }
}

export async function createOrder(formData: FormData) {
  const supabase = createAdminClient()

  // Generate order number
  // Gunakan random ID untuk menghindari duplikat order number
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const order = {
    order_number: orderNumber,
    customer_id: formData.get('customer_id') as string || null,
    total_amount: parseFloat(formData.get('total_amount') as string),
    discount: parseFloat(formData.get('discount') as string) || 0,
    tax: parseFloat(formData.get('tax') as string) || 0,
    status: formData.get('status') as 'pending' | 'processing' | 'completed' | 'cancelled',
    payment_status: formData.get('payment_status') as 'unpaid' | 'partial' | 'paid' | 'refunded',
    payment_method: formData.get('payment_method') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase
    .from('orders')
    .insert([order])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/cashier/history')
  return { success: true, error: null }
}

export async function createOrderWithItems(payload: CreateOrderPayload): Promise<{ success: boolean; error?: string; order_id?: string; order_number?: string }> {
  const supabase = createAdminClient()

  // Cek shift aktif untuk kasir (admin bypass)
  const { getUserRole } = await import('@/app/actions/auth')
  const role = await getUserRole()
  if (role === 'cashier') {
    const { getActiveShifts } = await import('@/app/actions/shifts')
    const { shifts } = await getActiveShifts()
    if (!shifts || shifts.length === 0) {
      return { success: false, error: 'Anda harus membuka shift terlebih dahulu sebelum membuat transaksi.' }
    }
  }

  // customer_id is now optional
  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: 'Tidak ada item dalam pesanan' }
  }

  // Validate sellable stock availability (excluding items expiring within 14 days)
  const productIds = Array.from(new Set(payload.items.map((i) => i.product_id)))
  
  const thresholdDate = new Date()
  thresholdDate.setHours(0, 0, 0, 0)
  thresholdDate.setDate(thresholdDate.getDate() + 14)

  const { data: batchesData, error: batchesError } = await supabase
    .from('product_batches')
    .select('product_id, quantity, expiry_date')
    .in('product_id', productIds)
    .gt('quantity', 0)

  if (batchesError) {
    return { success: false, error: batchesError.message }
  }

  const stockMap = new Map<string, number>()
  for (const b of batchesData || []) {
    // Only count if it doesn't expire within 14 days
    const isSellable = !b.expiry_date || new Date(b.expiry_date) > thresholdDate
    if (isSellable) {
      const current = stockMap.get(b.product_id) ?? 0
      stockMap.set(b.product_id, current + b.quantity)
    }
  }

  for (const item of payload.items) {
    const available = stockMap.get(item.product_id) ?? 0
    if (item.quantity > available) {
      return { success: false, error: `Stok layak jual (tidak mendekati kedaluwarsa) tidak cukup untuk produk: ${item.product_name}. Sisa: ${available}` }
    }
  }

  // Compute totals
  const itemsWithSubtotal = payload.items.map((i) => {
    const subtotal = i.unit_price * i.quantity - (i.discount || 0)
    return { ...i, subtotal: Math.max(0, subtotal) }
  })
  const total_amount = itemsWithSubtotal.reduce((sum, i) => sum + i.subtotal, 0)

  // Create order via stored procedure (atomicity)
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Persiapkan payload items untuk RPC
  const rpcItems = itemsWithSubtotal.map((i) => ({
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    subtotal: i.subtotal,
  }))

  const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_transaction', {
    p_order_number: orderNumber,
    p_customer_id: payload.customer_id || null,
    p_total_amount: total_amount,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes || null,
    p_items: rpcItems
  })

  if (rpcError) {
    return { success: false, error: rpcError.message || 'Transaksi gagal pada stored procedure' }
  }

  // Handle expected RPC format
  const parsedResult = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult
  if (!parsedResult?.success) {
    return { success: false, error: parsedResult?.error || 'Gagal menyimpan transaksi' }
  }

  const order_id = parsedResult.order_id

  // Cek dan kirim alert stok menipis secara terpisah, tidak ikut dalam transaksi atomik karena
  // melibatkan email third party/side effects.
  const { getSettings } = await import('@/app/actions/settings')
  const settings = await getSettings()
  const threshold = settings.lowStockThreshold || 8

  for (const item of payload.items) {
    const newStock = (stockMap.get(item.product_id) || 0) - item.quantity
    if (newStock <= threshold) {
      // Send email logic (did not await strictly to not block the response)
      sendLowStockEmail(item.product_name, newStock).catch(console.error)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/admin/reports')
  revalidatePath('/cashier/history')
  return { success: true, order_id, order_number: orderNumber }
}

export async function getCustomersForSelect(): Promise<{ customers: { id: string; name: string; email: string | null }[]; error: string | null }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, email, status')
    .order('created_at', { ascending: false })

  if (error) {
    return { customers: [], error: error.message }
  }
  const customers = (data || [])
    .filter((c: any) => c.status === 'active')
    .map((c: any) => ({ id: c.id as string, name: c.name as string, email: (c.email as string) ?? null }))
  return { customers, error: null }
}

export async function updateOrder(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const order = {
    customer_id: formData.get('customer_id') as string || null,
    total_amount: parseFloat(formData.get('total_amount') as string),
    discount: parseFloat(formData.get('discount') as string) || 0,
    tax: parseFloat(formData.get('tax') as string) || 0,
    status: formData.get('status') as 'pending' | 'processing' | 'completed' | 'cancelled',
    payment_status: formData.get('payment_status') as 'unpaid' | 'partial' | 'paid' | 'refunded',
    payment_method: formData.get('payment_method') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/cashier/history')
  return { success: true, error: null }
}


export async function deleteOrder(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/cashier/history')
  return { success: true, error: null }
}

export async function getOrderById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        name,
        email,
        phone,
        address
      ),
      order_items (
        *,
        products (
          name,
          product_code
        ),
        order_item_batches (
            quantity,
            product_batches (
                expiry_date
            )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return { order: null, error: error.message }
  }

  return { order: data, error: null }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin')
  revalidatePath('/admin/reports')
  revalidatePath('/cashier/history')
  return { success: true, error: null }
}
