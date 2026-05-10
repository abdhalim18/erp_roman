'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSettings } from '@/app/actions/settings'
import { unstable_noStore as noStore } from 'next/cache'

export type DashboardStats = {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    totalProducts: number
    lowStockItems: number
    lowStockThreshold: number
    lowStockProducts: { id: string; name: string; stock: number }[]
    totalCustomers: number
    recentActivities: {
        id: string
        type: 'order' | 'product' | 'customer'
        description: string
        time: string
        status: 'new' | 'warning' | 'success' | 'info'
    }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
    noStore()
    const supabase = createAdminClient()

    // Execute all independent queries in parallel
    const [
        ordersResult,
        pendingOrdersResult,
        paidOrdersResult,
        productsResult,
        customersResult,
        recentOrdersResult,
        recentCustomersResult
    ] = await Promise.all([
        // 1. Total Orders
        supabase.from('orders').select('*', { count: 'exact', head: true }),

        // 2. Pending Orders
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

        // 3. Total Revenue (fetch amounts of paid orders)
        supabase.from('orders').select('total_amount').or('payment_status.eq.paid,payment_status.eq.partial'),

        // 4. Products (count and fetch for low stock calculation)
        supabase.from('products').select('id, name, stock, min_stock'),

        // 5. Total Customers
        supabase.from('customers').select('*', { count: 'exact', head: true }),

        // 6. Recent Orders
        supabase.from('orders').select('id, order_number, created_at, status').order('created_at', { ascending: false }).limit(5),

        // 7. Recent Customers
        supabase.from('customers').select('id, name, created_at').order('created_at', { ascending: false }).limit(3)
    ])

    // Process Revenue
    let totalRevenue = 0
    if (paidOrdersResult.data) {
        totalRevenue = paidOrdersResult.data.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }

    // Process Low Stock — ambil threshold dari settings, bukan hardcode
    let lowStockItems = 0
    const lowStockProducts: { id: string; name: string; stock: number }[] = []
    const settings = await getSettings()
    const stockThreshold = settings.lowStockThreshold || 8

    if (productsResult.data) {
        productsResult.data.forEach(product => {
            const stock = product.stock ?? 0
            if (stock <= stockThreshold) {
                lowStockItems++
                lowStockProducts.push({
                    id: product.id,
                    name: product.name,
                    stock: stock
                })
            }
        })
    }

    // Inisialisasi array aktivitas
    const activities: DashboardStats['recentActivities'] = []

    // Tambahkan pesanan ke aktivitas (bahasa Indonesia)
    if (recentOrdersResult.data) {
        recentOrdersResult.data.forEach(order => {
            const statusLabel: Record<string, string> = {
                completed: 'selesai',
                pending: 'tertunda',
                processing: 'diproses',
                cancelled: 'dibatalkan'
            }
            activities.push({
                id: `order-${order.id}`,
                type: 'order',
                description: `Pesanan #${order.order_number} ${statusLabel[order.status] || order.status}`,
                time: new Date(order.created_at).toLocaleDateString('id-ID'),
                status: order.status === 'completed' ? 'success' : 'new'
            })
        })
    }

    // Tambahkan pelanggan baru ke aktivitas (bahasa Indonesia)
    if (recentCustomersResult.data) {
        recentCustomersResult.data.forEach(customer => {
            activities.push({
                id: `customer-${customer.id}`,
                type: 'customer',
                description: `Pelanggan baru: ${customer.name}`,
                time: new Date(customer.created_at).toLocaleDateString('id-ID'),
                status: 'info'
            })
        })
    }

    // Tambahkan alert stok menipis ke aktivitas
    lowStockProducts.slice(0, 2).forEach(product => {
        activities.push({
            id: `product-low-${product.id}`,
            type: 'product',
            description: `Stok menipis: ${product.name} (sisa ${product.stock})`,
            time: 'Baru saja',
            status: 'warning'
        })
    })

    return {
        totalRevenue,
        totalOrders: ordersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        totalProducts: productsResult.data?.length || 0,
        lowStockItems,
        lowStockThreshold: stockThreshold,
        lowStockProducts,
        totalCustomers: customersResult.count || 0,
        recentActivities: activities.slice(0, 6)
    }
}

export type ChartData = {
    date: string
    pendapatan: number
}

export async function getDashboardCharts(): Promise<ChartData[]> {
    noStore()
    const supabase = createAdminClient()

    // 1. Get orders from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch orders with order_items and products to calculate cost
    // We need to fetch all paid orders in range
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            total_amount
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .or('payment_status.eq.paid,payment_status.eq.partial')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching chart data:', error)
        return []
    }

    // 2. Group by date and calculate totals
    const dailyMap = new Map<string, { revenue: number }>()

    // Initialize last 30 days with 0 to show empty days
    for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toLocaleDateString('en-CA') // YYYY-MM-DD
        dailyMap.set(dateStr, { revenue: 0 })
    }

    orders?.forEach(order => {
        const dateStr = new Date(order.created_at).toLocaleDateString('en-CA')

        // Use the actual total_amount from the order which includes discounts and tax correctly
        const orderRevenue = order.total_amount || 0

        const current = dailyMap.get(dateStr) || { revenue: 0 }

        // Accumulate
        dailyMap.set(dateStr, {
            revenue: current.revenue + orderRevenue
        })
    })

    // Convert map to sorted array
    const chartData = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), // Format for display
            originalDate: date, // Keep for sorting
            pendapatan: stats.revenue
        }))
        .sort((a, b) => a.originalDate.localeCompare(b.originalDate))
        .map(({ date, pendapatan }) => ({ date, pendapatan }))

    return chartData
}

export type ExpiringBatch = {
    id: string
    product_id: string
    product_name: string
    kode_produk: string
    quantity: number
    expiry_date: string
    days_to_expiry: number
}

export async function getExpiringBatches(daysThreshold = 30): Promise<ExpiringBatch[]> {
    noStore()
    const supabase = createAdminClient()

    // Ambil batch yang akan kadaluarsa DALAM daysThreshold hari ke depan
    // Termasuk yang SUDAH kadaluarsa (days_to_expiry < 0) agar admin bisa tindak lanjut
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    const { data: batches, error } = await supabase
        .from('product_batches')
        .select(`
            id,
            product_id,
            quantity,
            expiry_date,
            products (name, kode_produk)
        `)
        .not('expiry_date', 'is', null)
        .gt('quantity', 0)
        .lte('expiry_date', thresholdDate.toISOString().split('T')[0]) // filter di DB, lebih efisien
        .order('expiry_date', { ascending: true })
        .limit(20)

    if (error || !batches) {
        return []
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiring: ExpiringBatch[] = batches.map((batch: any) => {
        const expiryDate = new Date(batch.expiry_date)
        const diffTime = expiryDate.getTime() - today.getTime()
        // Negatif = sudah kadaluarsa, positif = belum kadaluarsa
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
            id: batch.id,
            product_id: batch.product_id,
            product_name: Array.isArray(batch.products) ? (batch.products[0]?.name || 'Tidak diketahui') : (batch.products?.name || 'Tidak diketahui'),
            kode_produk: Array.isArray(batch.products) ? (batch.products[0]?.kode_produk || '-') : (batch.products?.kode_produk || '-'),
            quantity: batch.quantity,
            expiry_date: batch.expiry_date,
            days_to_expiry: daysToExpiry
        }
    })

    return expiring
}
