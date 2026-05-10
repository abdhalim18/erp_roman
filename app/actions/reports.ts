'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'

export type ProductSalesReport = {
  product_id: string
  product_name: string
  total_sold: number
  total_revenue: number
}

export async function getProductSalesReport(params?: { startDate?: string; endDate?: string }): Promise<{ data: ProductSalesReport[], error: string | null }> {
  noStore()
  const supabase = createAdminClient()
  
  let query = supabase
    .from('order_items')
    .select(`
      product_id,
      product_name,
      quantity,
      subtotal,
      orders!inner(status, created_at)
    `)
    .eq('orders.status', 'completed')

  if (params?.startDate) {
    query = query.gte('orders.created_at', params.startDate)
  }
  if (params?.endDate) {
    query = query.lte('orders.created_at', params.endDate)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  const reportMap = new Map<string, ProductSalesReport>()
  
  if (data) {
    data.forEach((item: { product_name: string; product_id?: string; quantity?: number; subtotal?: number }) => {
      const key = item.product_name 
      if (!reportMap.has(key)) {
        reportMap.set(key, {
          product_id: item.product_id || '',
          product_name: item.product_name,
          total_sold: 0,
          total_revenue: 0
        })
      }
      const report = reportMap.get(key)!
      report.total_sold += item.quantity || 0
      report.total_revenue += item.subtotal || 0
    })
  }
  
  const reportList = Array.from(reportMap.values())
  // sort by total_sold descending
  reportList.sort((a, b) => b.total_sold - a.total_sold)

  return { data: reportList, error: null }
}

export type SalesReportRow = {
  date: string
  total_transactions: number
  total_items: number
  total_revenue: number
}

export async function getSalesReport(params?: { startDate?: string; endDate?: string; groupBy?: 'day' | 'month' }): Promise<{ data: SalesReportRow[], error: string | null }> {
  noStore()
  const supabase = createAdminClient()
  
  let query = supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      created_at,
      order_items (
        quantity
      )
    `)
    .eq('status', 'completed')

  if (params?.startDate) {
    query = query.gte('created_at', params.startDate)
  }
  if (params?.endDate) {
    query = query.lte('created_at', params.endDate)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  const reportMap = new Map<string, any>()
  const groupBy = params?.groupBy || 'day'
  
  if (data) {
    data.forEach((order: { created_at: string; total_amount?: number; order_items?: { quantity: number }[] }) => {
      const dateObj = new Date(order.created_at)
      let key = ''
      let sortTime = 0

      if (groupBy === 'month') {
        key = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        sortTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getTime()
      } else {
        key = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        sortTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime()
      }

      if (!reportMap.has(key)) {
        reportMap.set(key, {
          date: key,
          sort_date: sortTime,
          total_transactions: 0,
          total_items: 0,
          total_revenue: 0
        })
      }
      
      const report = reportMap.get(key)!
      report.total_transactions += 1
      report.total_revenue += order.total_amount || 0
      const itemsCount = order.order_items?.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity || 0), 0) || 0
      report.total_items += itemsCount
    })
  }
  
  const reportList = Array.from(reportMap.values())
  // sort by date descending
  reportList.sort((a, b) => b.sort_date - a.sort_date)

  return { data: reportList.map(({ sort_date, ...rest }) => rest as SalesReportRow), error: null }
}

export type ProductTransactionRow = {
  id: string
  date: string
  sort_date: number
  product_name: string
  payment_method: string | null
  quantity: number
  revenue: number
  cost_total: number
}

export async function getSalesReportPerProduct(params?: { startDate?: string; endDate?: string; paymentMethod?: string; groupBy?: 'day' | 'month' | 'transaction' }): Promise<{ data: ProductTransactionRow[], error: string | null }> {
  noStore()
  const supabase = createAdminClient()
  
  let query = supabase
    .from('order_items')
    .select(`
      id,
      product_id,
      product_name,
      quantity,
      subtotal,
      orders!inner(id, created_at, status, payment_method),
      products(cost)
    `)
    .eq('orders.status', 'completed')

  if (params?.startDate) {
    query = query.gte('orders.created_at', params.startDate)
  }
  if (params?.endDate) {
    query = query.lte('orders.created_at', params.endDate)
  }
  if (params?.paymentMethod && params.paymentMethod !== 'all') {
    query = query.eq('orders.payment_method', params.paymentMethod)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  const groupBy = params?.groupBy || 'transaction'

  if (groupBy === 'month' || groupBy === 'day') {
    const reportMap = new Map<string, ProductTransactionRow>()
    if (data) {
      data.forEach((item: any) => {
        const dateObj = new Date(item.orders.created_at)
        let dateStr = ''
        let sortTime = 0

        if (groupBy === 'month') {
          dateStr = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
          sortTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getTime()
        } else {
          dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          sortTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime()
        }

        const pmStr = item.orders.payment_method || 'Unknown'
        const key = groupBy === 'month' ? dateStr : `${dateStr}-${item.product_name}-${pmStr}`
        const unitCost = item.products?.cost || 0

        if (!reportMap.has(key)) {
          reportMap.set(key, {
            id: key,
            date: dateStr,
            sort_date: sortTime,
            product_name: groupBy === 'month' ? '-' : item.product_name,
            payment_method: groupBy === 'month' ? null : item.orders.payment_method,
            quantity: 0,
            revenue: 0,
            cost_total: 0
          })
        }
        
        const report = reportMap.get(key)!
        report.quantity += item.quantity || 0
        report.revenue += item.subtotal || 0
        report.cost_total += unitCost * (item.quantity || 0)
      })
    }
    const reportList = Array.from(reportMap.values())
    // Sort by date DESC, then quantity DESC
    reportList.sort((a, b) => {
      if (b.sort_date !== a.sort_date) return b.sort_date - a.sort_date
      return b.quantity - a.quantity
    })
    return { data: reportList, error: null }
  } else {
    // transaction level
    const reportList: ProductTransactionRow[] = []
    if (data) {
      data.forEach((item: any) => {
        const dateObj = new Date(item.orders.created_at)
        const unitCost = item.products?.cost || 0
        reportList.push({
          id: item.id,
          date: dateObj.toLocaleString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          }),
          sort_date: dateObj.getTime(),
          product_name: item.product_name,
          payment_method: item.orders.payment_method,
          quantity: item.quantity || 0,
          revenue: item.subtotal || 0,
          cost_total: unitCost * (item.quantity || 0)
        })
      })
    }
    // sort by created_at DESC
    reportList.sort((a, b) => b.sort_date - a.sort_date)
    return { data: reportList, error: null }
  }
}
