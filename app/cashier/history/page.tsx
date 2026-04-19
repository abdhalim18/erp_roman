import { getOrders, OrderItem } from '@/app/actions/orders'
import { History, ShoppingBag } from 'lucide-react'

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

export default async function CashierHistoryPage() {
    const { orders } = await getOrders()
    const recentOrders = orders?.slice(0, 20) || []

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Riwayat Transaksi</h1>
                <p className="text-sm text-gray-500 mt-0.5">Daftar 20 transaksi terbaru.</p>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Daftar Transaksi</p>
                    <span className="text-xs text-gray-400">{recentOrders.length} transaksi</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No. Order</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <History className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Belum ada transaksi</p>
                                            <p className="text-xs mt-1">Transaksi yang selesai akan muncul di sini</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
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
                                            {order.customer?.name || 'Tamu'}
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
