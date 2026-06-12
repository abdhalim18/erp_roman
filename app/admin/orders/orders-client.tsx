'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, ShoppingCart, Eye, MoreHorizontal, Edit, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatusDialog } from './order-status-dialog'
import { Order, getOrders } from '@/app/actions/orders'

interface OrdersClientProps {
    initialOrders: Order[]
}

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    processing: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
    completed: 'Selesai',
    processing: 'Diproses',
    pending: 'Tertunda',
    cancelled: 'Dibatalkan',
}

const STATUS_ROW_BORDER: Record<string, string> = {
    completed: 'border-l-4 border-l-emerald-400',
    processing: 'border-l-4 border-l-blue-400',
    pending: 'border-l-4 border-l-amber-400',
    cancelled: 'border-l-4 border-l-red-300',
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
    const [orders, setOrders] = useState(initialOrders)
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [activeTab, setActiveTab] = useState<string>('all')
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 20

    useEffect(() => {
        async function fetchLatestOrders() {
            const { orders: latestOrders } = await getOrders()
            if (latestOrders) {
                setOrders(latestOrders)
            }
        }
        fetchLatestOrders()
    }, [])

    const baseFiltered = orders.filter((order) => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order as any).customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        let matchesDate = true
        if (startDate || endDate) {
            const orderDateStr = new Date(order.created_at).toISOString().split('T')[0]
            if (startDate && orderDateStr < startDate) matchesDate = false
            if (endDate && orderDateStr > endDate) matchesDate = false
        }
        return matchesSearch && matchesDate
    })

    const filteredOrders = activeTab === 'all'
        ? baseFiltered
        : baseFiltered.filter(o => o.status === activeTab)

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const totalOrders = baseFiltered.length
    const pendingOrders = baseFiltered.filter((o) => o.status === 'pending').length
    const completedOrders = baseFiltered.filter((o) => o.status === 'completed').length
    const processingOrders = baseFiltered.filter((o) => o.status === 'processing').length
    const cancelledOrders = baseFiltered.filter((o) => o.status === 'cancelled').length
    const totalRevenue = baseFiltered
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    const handleEditStatus = (order: Order) => {
        setSelectedOrder(order)
        setStatusDialogOpen(true)
    }

    const handleStatusUpdateSuccess = () => {
        if (selectedOrder) window.location.reload()
    }


    const tabs = [
        { key: 'all', label: 'Semua', count: totalOrders },
        { key: 'pending', label: 'Tertunda', count: pendingOrders, color: 'text-amber-600' },
        { key: 'processing', label: 'Diproses', count: processingOrders, color: 'text-blue-600' },
        { key: 'completed', label: 'Selesai', count: completedOrders, color: 'text-emerald-600' },
        { key: 'cancelled', label: 'Dibatalkan', count: cancelledOrders, color: 'text-red-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Penjualan</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Monitor dan kelola seluruh transaksi secara real-time
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button size="sm" asChild className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href="/admin/orders/new">
                            <Plus className="h-3.5 w-3.5" />
                            Penjualan Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Transaksi', value: totalOrders, sub: 'Semua status', gradient: 'from-blue-500 to-indigo-500', icon: <ShoppingCart className="h-5 w-5 text-white" />, bubble: 'bg-blue-50' },
                    { label: 'Tertunda', value: pendingOrders, sub: 'Menunggu diproses', gradient: 'from-amber-400 to-orange-500', icon: <Clock className="h-5 w-5 text-white" />, bubble: 'bg-amber-50' },
                    { label: 'Selesai', value: completedOrders, sub: 'Berhasil diselesaikan', gradient: 'from-emerald-400 to-teal-500', icon: <CheckCircle className="h-5 w-5 text-white" />, bubble: 'bg-emerald-50' },
                    { label: 'Pendapatan', value: formatCurrency(totalRevenue), sub: 'Transaksi non-batal', gradient: 'from-violet-500 to-purple-600', icon: <DollarSign className="h-5 w-5 text-white" />, bubble: 'bg-violet-50', small: true },
                ].map(card => (
                    <div key={card.label} className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                                <p className={`mt-2 font-bold text-gray-900 ${card.small ? 'text-xl' : 'text-2xl'}`}>{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className={`absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full ${card.bubble} opacity-60`} />
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Controls */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wide font-medium shrink-0">Periode:</Label>
                        <Input
                            type="date"
                            className="h-8 text-sm border-gray-200 w-36"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setCurrentPage(1) }}
                        />
                        <span className="text-gray-400 text-xs">s/d</span>
                        <Input
                            type="date"
                            className="h-8 text-sm border-gray-200 w-36"
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); setCurrentPage(1) }}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            placeholder="Cari no. penjualan..."
                            className="pl-9 h-8 w-52 text-sm border-gray-200"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-0 border-b border-gray-100 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setCurrentPage(1) }}
                            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5
                                ${activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-indigo-50/60 border-b-2 border-indigo-100">
                                <th className="px-5 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider">No. Penjualan</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Waktu</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Pembayaran</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Item</th>
                                <th className="px-4 py-3.5 text-right text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-right text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ShoppingCart className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Tidak ada penjualan ditemukan</p>
                                            <p className="text-xs mt-1">Coba ubah filter status atau rentang tanggal</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order, idx) => {
                                    const isEven = idx % 2 === 0
                                    return (
                                        <tr key={order.id} className={`hover:bg-indigo-50/30 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/40'} ${STATUS_ROW_BORDER[order.status] || ''}`}>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-mono font-semibold text-gray-900">{order.order_number}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-xs font-medium text-gray-700">{formatDate(order.created_at)}</p>
                                            <p className="text-[11px] text-gray-400">{formatTime(order.created_at)}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                {order.payment_method ? order.payment_method.toUpperCase() : 'TUNAI'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                {((order as any).order_items || []).length === 0 ? (
                                                    <span className="text-xs text-gray-400 italic">—</span>
                                                ) : (
                                                    <>
                                                        {(order as any).order_items.slice(0, 3).map((item: any, idx: number) => (
                                                            <span key={idx} className="text-xs text-gray-700 line-clamp-1" title={item.products?.name || item.product_name}>
                                                                {item.products?.name || item.product_name || 'Produk'}
                                                                <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                                            </span>
                                                        ))}
                                                        {((order as any).order_items || []).length > 3 && (
                                                            <span className="text-[10px] font-medium text-indigo-500 mt-0.5">
                                                                + {((order as any).order_items || []).length - 3} produk lainnya
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="text-sm">
                                                    <DropdownMenuLabel className="text-xs text-gray-500">Aksi</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Lihat Detail
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditStatus(order)} className="flex items-center gap-2">
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Ubah Status
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span>–
                            <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> dari{' '}
                            <span className="font-medium text-gray-900">{filteredOrders.length}</span> hasil
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                Sebelumnya
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrderStatusDialog
                    open={statusDialogOpen}
                    onOpenChange={setStatusDialogOpen}
                    orderId={selectedOrder.id}
                    currentStatus={selectedOrder.status}
                    onSuccess={handleStatusUpdateSuccess}
                />
            )}
        </div>
    )
}

