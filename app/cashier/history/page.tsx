import { getOrders, OrderItem } from '@/app/actions/orders'

export const dynamic = 'force-dynamic'

export default async function CashierHistoryPage() {
    const { orders } = await getOrders()

    // Filter for today's orders (client-side filtering for simplicity, or ideally server-side)
    // For now, let's just show the latest 20 orders
    const recentOrders = orders?.slice(0, 20) || []

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Riwayat Transaksi</h2>
                <p className="text-gray-500">Daftar transaksi terbaru.</p>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">No. Order</th>
                            <th className="px-4 py-3 font-medium">Waktu</th>
                            <th className="px-4 py-3 font-medium">Pelanggan</th>
                            <th className="px-4 py-3 font-medium">Items</th>
                            <th className="px-4 py-3 font-medium text-right">Total</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {recentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                    Belum ada transaksi hari ini.
                                </td>
                            </tr>
                        ) : (
                            recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number || order.id.substring(0, 8)}</td>
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900">
                                        {order.customer?.name || 'Umum'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900">
                                        <div className="flex flex-col gap-1">
                                            {order.order_items?.map((item: OrderItem & { products: { name: string } | null }, idx: number) => {
                                                const productName = item.products?.name || item.product_name || 'Unknown Product'
                                                return (
                                                    <span key={idx} className="text-sm">
                                                        {productName} <span className="text-gray-500">(x{item.quantity})</span>
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        Rp {order.total_amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
