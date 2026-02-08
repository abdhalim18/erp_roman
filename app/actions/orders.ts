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
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

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
  return { success: true, error: null }
}

export async function createOrderWithItems(payload: CreateOrderPayload): Promise<{ success: boolean; error?: string; order_id?: string; order_number?: string }> {
  const supabase = createAdminClient()

  // customer_id is now optional
  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: 'No items in order' }
  }

  // Validate stock availability
  const productIds = Array.from(new Set(payload.items.map((i) => i.product_id)))
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, stock')
    .in('id', productIds)

  if (productsError) {
    return { success: false, error: productsError.message }
  }

  const stockMap = new Map<string, number>()
  for (const p of productsData || []) {
    stockMap.set(p.id as string, p.stock as number)
  }
  for (const item of payload.items) {
    const available = stockMap.get(item.product_id) ?? 0
    if (item.quantity > available) {
      return { success: false, error: `Insufficient stock for product ${item.product_name}` }
    }
  }

  // Compute totals
  const itemsWithSubtotal = payload.items.map((i) => {
    const subtotal = i.unit_price * i.quantity - (i.discount || 0)
    return { ...i, subtotal: Math.max(0, subtotal) }
  })
  const total_amount = itemsWithSubtotal.reduce((sum, i) => sum + i.subtotal, 0)

  // Create order first and get id
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  const orderRow = {
    order_number: orderNumber,
    customer_id: payload.customer_id || null, // Handle undefined/null
    total_amount,
    discount: 0,
    tax: 0,
    status: 'completed' as const,
    payment_status: 'paid' as const,
    payment_method: payload.payment_method,
    notes: payload.notes || null,
  }

  const { data: insertedOrders, error: insertOrderError } = await supabase
    .from('orders')
    .insert([orderRow])
    .select('id, order_number')
    .limit(1)

  if (insertOrderError || !insertedOrders || insertedOrders.length === 0) {
    return { success: false, error: insertOrderError?.message || 'Failed to create order' }
  }

  const order_id = insertedOrders[0].id as string

  // Insert order items
  const orderItems = itemsWithSubtotal.map((i) => ({
    order_id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    subtotal: i.subtotal,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  // Decrement stock for each product
  for (const item of payload.items) {
    const newStock = (stockMap.get(item.product_id) || 0) - item.quantity
    const { error: updError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.product_id)

    if (updError) {
      return { success: false, error: updError.message }
    }

    // Check for low stock alert
    // Fetch settings to get dynamic threshold
    const { getSettings } = await import('@/app/actions/settings') // Dynamic import to avoid circular dep if any
    const settings = await getSettings()
    const threshold = settings.lowStockThreshold || 8

    if (newStock <= threshold) {
      // Allow this to fail silently so it doesn't block the order
      await sendLowStockEmail(item.product_name, newStock).catch(console.error)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin/products')
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
          sku
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
  return { success: true, error: null }
}
