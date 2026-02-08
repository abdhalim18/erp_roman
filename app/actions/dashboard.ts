'use server'

import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    totalProducts: number
    lowStockItems: number
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
    const supabase = await createClient()

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
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),

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

    // Process Low Stock
    let lowStockItems = 0
    const lowStockProducts: { id: string; name: string; stock: number }[] = []

    if (productsResult.data) {
        productsResult.data.forEach(product => {
            const stock = product.stock ?? 0
            // const minStock = product.min_stock ?? 0 // Ignoring min_stock for now as per request (8 pcs)
            const threshold = 8
            if (stock <= threshold) {
                lowStockItems++
                lowStockProducts.push({
                    id: product.id,
                    name: product.name,
                    stock: stock
                })
            }
        })
    }

    // Process Recent Activities
    const activities: DashboardStats['recentActivities'] = []

    // Add orders to activities
    if (recentOrdersResult.data) {
        recentOrdersResult.data.forEach(order => {
            activities.push({
                id: `order-${order.id}`,
                type: 'order',
                description: `Order #${order.order_number} is ${order.status}`,
                time: new Date(order.created_at).toLocaleDateString(), // Simplification
                status: order.status === 'completed' ? 'success' : 'new'
            })
        })
    }

    // Add customers to activities
    if (recentCustomersResult.data) {
        recentCustomersResult.data.forEach(customer => {
            activities.push({
                id: `customer-${customer.id}`,
                type: 'customer',
                description: `New customer: ${customer.name}`,
                time: new Date(customer.created_at).toLocaleDateString(),
                status: 'info'
            })
        })
    }

    // Add low stock alerts to activities (top 2)
    lowStockProducts.slice(0, 2).forEach(product => {
        activities.push({
            id: `product-low-${product.id}`,
            type: 'product',
            description: `Low stock: ${product.name} (${product.stock} left)`,
            time: 'Just now',
            status: 'warning'
        })
    })

    return {
        totalRevenue,
        totalOrders: ordersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        totalProducts: productsResult.data?.length || 0,
        lowStockItems,
        lowStockProducts,
        totalCustomers: customersResult.count || 0,
        recentActivities: activities.slice(0, 6) // limit
    }
}

export type ChartData = {
    date: string
    revenue: number
    profit: number
}

export async function getDashboardCharts(): Promise<ChartData[]> {
    const supabase = await createClient()

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
            total_amount,
            order_items (
                quantity,
                unit_price,
                product_id,
                products (
                    cost
                )
            )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .or('payment_status.eq.paid,payment_status.eq.partial')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching chart data:', error)
        return []
    }

    // 2. Group by date and calculate totals
    const dailyMap = new Map<string, { revenue: number, profit: number }>()

    // Initialize last 30 days with 0 to show empty days
    for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toLocaleDateString('en-CA') // YYYY-MM-DD
        dailyMap.set(dateStr, { revenue: 0, profit: 0 })
    }

    orders?.forEach(order => {
        const dateStr = new Date(order.created_at).toLocaleDateString('en-CA')

        let orderRevenue = 0
        let orderCost = 0

        // @ts-ignore - Supabase type for joined query is tricky
        order.order_items.forEach((item: any) => {
            const qty = item.quantity || 0
            const price = item.unit_price || 0
            const cost = item.products?.cost || 0

            orderRevenue += (price * qty)
            orderCost += (cost * qty)
        })

        const current = dailyMap.get(dateStr) || { revenue: 0, profit: 0 }

        // Accumulate
        dailyMap.set(dateStr, {
            revenue: current.revenue + orderRevenue,
            profit: current.profit + (orderRevenue - orderCost)
        })
    })

    // Convert map to sorted array
    const chartData = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), // Format for display
            originalDate: date, // Keep for sorting
            revenue: stats.revenue,
            profit: stats.profit
        }))
        .sort((a, b) => a.originalDate.localeCompare(b.originalDate))
        .map(({ date, revenue, profit }) => ({ date, revenue, profit }))

    return chartData
}
