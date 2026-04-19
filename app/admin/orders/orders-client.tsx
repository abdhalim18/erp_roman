'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, ShoppingCart, Eye, MoreHorizontal, Edit, Printer, DollarSign, Clock, CheckCircle, ChevronDown, FileText, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatusDialog } from './order-status-dialog'
import { Order } from '@/app/actions/orders'

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

export function OrdersClient({ initialOrders }: OrdersClientProps) {
    const [orders, setOrders] = useState(initialOrders)
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 20

    const filteredOrders = orders.filter((order) => {
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

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )

    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter((o) => o.status === 'pending').length
    const completedOrders = filteredOrders.filter((o) => o.status === 'completed').length
    const totalRevenue = filteredOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    const statusCounts = {
        pending: pendingOrders,
        processing: filteredOrders.filter((o) => o.status === 'processing').length,
        completed: completedOrders,
        cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

    const handleEditStatus = (order: Order) => {
        setSelectedOrder(order)
        setStatusDialogOpen(true)
    }

    const handleStatusUpdateSuccess = () => {
        if (selectedOrder) window.location.reload()
    }

    const handleExportExcel = () => {
        const exportData = filteredOrders.map(o => ({
            'No. Pesanan': o.order_number,
            'Tanggal': new Date(o.created_at).toLocaleString('id-ID'),
            'Pelanggan': (o as any).customers?.name || 'Tamu',
            'Status': STATUS_LABELS[o.status] || o.status,
            'Pembayaran': o.payment_method === 'cash' ? 'Tunai' : o.payment_method === 'qris' ? 'QRIS' : 'Transfer',
            'Total': typeof o.total_amount === 'number' ? o.total_amount : 0
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Pesanan")
        XLSX.writeFile(wb, `Laporan_Pesanan_${startDate || 'Awal'}_SD_${endDate || 'Akhir'}.xlsx`)
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        
        doc.setFontSize(16)
        doc.text("Laporan Penjualan Toko Roman", 14, 15)
        doc.setFontSize(10)
        doc.text(`Periode: ${startDate || 'Awal'} - ${endDate || 'Sekarang'}`, 14, 22)

        const tableColumn = ["No. Pesanan", "Tanggal", "Pelanggan", "Status", "Metode", "Total"]
        const tableRows = filteredOrders.map(o => [
            o.order_number,
            new Date(o.created_at).toLocaleString('id-ID'),
            (o as any).customers?.name || 'Tamu',
            STATUS_LABELS[o.status] || o.status,
            o.payment_method === 'cash' ? 'Tunai' : o.payment_method === 'qris' ? 'QRIS' : 'Transfer',
            formatCurrency(o.total_amount || 0)
        ])

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [16, 185, 129] } // emerald-500 color from Toko Roman branding
        })

        doc.save(`Laporan_Pesanan_${startDate || 'Awal'}_SD_${endDate || 'Akhir'}.pdf`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight print:hidden">Pesanan</h1>
                    <h1 className="text-2xl font-bold text-black hidden print:block text-center">Laporan Penjualan</h1>
                    <p className="text-sm text-gray-500 mt-0.5 print:text-center">
                        {startDate || endDate
                            ? `Periode: ${startDate || 'Awal'} – ${endDate || 'Akhir'}`
                            : 'Kelola pesanan pelanggan dan transaksi'}
                    </p>
                </div>
                <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1.5">
                                <Download className="h-4 w-4" />
                                Export Data
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Pilih Format</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                                <Printer className="h-4 w-4 mr-2 text-emerald-600" />
                                Export Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2 text-rose-600" />
                                Export PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" asChild className="gap-1.5">
                        <Link href="/admin/orders/new">
                            <Plus className="h-3.5 w-3.5" />
                            Pesanan Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pesanan</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{totalOrders}</p>
                            <p className="text-xs text-gray-400 mt-1">Semua pesanan</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm">
                            <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-indigo-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tertunda</p>
                            <p className="mt-2 text-2xl font-bold text-amber-500">{pendingOrders}</p>
                            <p className="text-xs text-gray-400 mt-1">Menunggu diproses</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-amber-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Selesai</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-600">{completedOrders}</p>
                            <p className="text-xs text-gray-400 mt-1">Berhasil diselesaikan</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pendapatan</p>
                            <p className="mt-2 text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            <p className="text-xs text-gray-400 mt-1">Dari semua pesanan</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-violet-50 opacity-60" />
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden print:shadow-none print:border-none">
                {/* Table Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 px-5 py-4 border-b border-gray-100 print:hidden">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Daftar Pesanan</p>
                        <p className="text-xs text-gray-400">{filteredOrders.length} pesanan ditampilkan</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="startDate" className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Dari</Label>
                            <Input
                                id="startDate"
                                type="date"
                                className="h-8 text-sm border-gray-200 w-36"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endDate" className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Sampai</Label>
                            <Input
                                id="endDate"
                                type="date"
                                className="h-8 text-sm border-gray-200 w-36"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Cari pesanan..."
                                className="pl-9 h-8 w-52 text-sm border-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 print:hidden">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> hingga{' '}
                            <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> dari{' '}
                            <span className="font-medium text-gray-900">{filteredOrders.length}</span> hasil
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ID Pesanan</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider print:hidden">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ShoppingCart className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Tidak ada pesanan ditemukan</p>
                                            <p className="text-xs mt-1">Coba kata kunci lain atau buat pesanan baru</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-mono font-medium text-gray-900">{order.order_number}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{(order as any).customers?.name || 'Tamu'}</td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{(order as any).order_items?.length || 0} item</td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right print:hidden">
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom: Status Distribution */}
            <div className="grid gap-5 md:grid-cols-2 print:hidden">
                {/* Recent Orders */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">Pesanan Terbaru</p>
                        <p className="text-xs text-gray-400">Aktivitas pesanan terbaru</p>
                    </div>
                    <div className="px-5 py-3 divide-y divide-gray-50">
                        {filteredOrders.slice(0, 5).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">Tidak ada pesanan terbaru</p>
                        ) : (
                            filteredOrders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-mono font-medium text-gray-900">{order.order_number}</p>
                                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                                        <p className="text-xs text-gray-400">{(order as any).customers?.name || 'Tamu'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">Distribusi Status</p>
                        <p className="text-xs text-gray-400">Ringkasan status pesanan</p>
                    </div>
                    <div className="px-5 py-3 space-y-3">
                        {[
                            { label: 'Tertunda', count: statusCounts.pending, color: 'bg-amber-400' },
                            { label: 'Diproses', count: statusCounts.processing, color: 'bg-blue-400' },
                            { label: 'Selesai', count: statusCounts.completed, color: 'bg-emerald-400' },
                            { label: 'Dibatalkan', count: statusCounts.cancelled, color: 'bg-red-400' },
                        ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                                <span className="text-sm text-gray-600 flex-1">{label}</span>
                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                {totalOrders > 0 && (
                                    <span className="text-xs text-gray-400 w-10 text-right">
                                        {Math.round((count / totalOrders) * 100)}%
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
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
