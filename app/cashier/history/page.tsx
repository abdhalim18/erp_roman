import { getOrders, OrderItem } from '@/app/actions/orders'
import { getPaymentMethods } from '@/app/actions/payment_methods'
import { History, CalendarDays } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border border-blue-200',
}

const STATUS_LABELS: Record<string, string> = {
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    pending: 'Tertunda',
    processing: 'Diproses',
}

export default async function CashierHistoryPage({ searchParams }: { searchParams?: { filter?: string } }) {
    const filter = searchParams?.filter || 'all'
    
    const [{ orders }, { data: paymentMethods }] = await Promise.all([
        getOrders(),
        getPaymentMethods()
    ])

    const pmMap = new Map<string, string>()
    for (const pm of paymentMethods || []) {
        pmMap.set(pm.id, pm.name)
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const filteredOrders = (orders || []).filter(order => {
        const orderDate = new Date(order.created_at)
        if (filter === 'daily') {
            return orderDate >= today
        } else if (filter === 'weekly') {
            return orderDate >= weekAgo
        }
        return true
    })

    const displayOrders = filteredOrders.slice(0, 50)

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Riwayat Transaksi</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Daftar transaksi berdasarkan rentang waktu.</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-emerald-100 rounded-lg p-1 self-start sm:self-auto shadow-sm">
                    <Link 
                        href="/cashier/history" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Semua
                    </Link>
                    <Link 
                        href="/cashier/history?filter=daily" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'daily' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Hari Ini
                    </Link>
                    <Link 
                        href="/cashier/history?filter=weekly" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'weekly' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Minggu Ini
                    </Link>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Daftar Transaksi {filter === 'daily' ? 'Hari Ini' : filter === 'weekly' ? 'Minggu Ini' : 'Terbaru'}</p>
                    <span className="text-xs text-gray-400">{displayOrders.length} transaksi</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No. Order</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pembayaran</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <History className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Belum ada transaksi</p>
                                            <p className="text-xs mt-1">Coba ubah rentang filter waktu di atas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3.5 font-mono font-medium text-gray-900 text-xs">
                                            {order.order_number || order.id.substring(0, 8)}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm font-medium text-gray-700">
                                            <span className="inline-flex items-center">
                                                {order.payment_method ? (pmMap.get(order.payment_method) || order.payment_method.toUpperCase()) : 'TUNAI'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                {order.order_items?.map((item: OrderItem & { products: { name: string } | null }, idx: number) => {
                                                    const productName = item.products?.name || item.product_name || 'Produk'
                                                    return (
                                                        <span key={idx} className="text-xs text-gray-600">
                                                            {productName} <span className="text-gray-400">×{item.quantity}</span>
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                                            Rp {order.total_amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
