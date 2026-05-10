import { Fragment } from 'react'
import { getOrderById } from '@/app/actions/orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Download, User, MapPin, Phone, Mail, ShoppingCart, CreditCard, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
    completed: 'Selesai',
    processing: 'Diproses',
    pending: 'Tertunda',
    cancelled: 'Dibatalkan',
}

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    processing: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    paid: 'Lunas',
    partial: 'Sebagian',
    unpaid: 'Belum Bayar',
    refunded: 'Dikembalikan',
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border border-amber-200',
    unpaid: 'bg-red-50 text-red-700 border border-red-200',
    refunded: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: '💵 Tunai',
    qris: '📲 QRIS',
    transfer: '📱 Transfer',
    card: '💳 Kartu',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { order, error } = await getOrderById(params.id)

    if (error || !order) {
        if (!order) notFound()
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm">
                    <span className="font-medium">Gagal memuat pesanan:</span> {error}
                </div>
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl border border-gray-200 hover:bg-gray-50">
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Pesanan {order.order_number}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Dibuat pada {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl border-gray-200">
                        <Printer className="h-3.5 w-3.5" />
                        Cetak
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl border-gray-200">
                        <Download className="h-3.5 w-3.5" />
                        Unduh
                    </Button>
                </div>
            </div>

            {/* Status Cards Row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status Pesanan</p>
                            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {STATUS_LABELS[order.status] || order.status}
                            </span>
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
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status Pembayaran</p>
                            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[order.payment_status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                            </span>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                            <p className="mt-2 text-xl font-bold text-emerald-600">{formatCurrency(order.total_amount)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || '-'}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-violet-50 opacity-60" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">Item Pesanan</p>
                            <p className="text-xs text-gray-400">{order.order_items?.length || 0} produk dalam pesanan ini</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60">
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
                                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                                        <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Jml</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.order_items?.map((item: any) => (
                                        <Fragment key={item.id}>
                                            <tr className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                        {item.products?.product_code || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-sm text-gray-600">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-sm text-gray-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                            {/* Detail Pengambilan Stok FEFO */}
                                            {item.order_item_batches && item.order_item_batches.length > 0 && (
                                                <tr className="bg-blue-50/30">
                                                    <td colSpan={4} className="px-5 py-2.5">
                                                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                            <span className="font-semibold text-gray-600">Detail Pengambilan Stok (FEFO):</span>
                                                            {item.order_item_batches.map((batchEdge: any, idx: number) => {
                                                                const expiry = batchEdge.product_batches?.expiry_date
                                                                    ? new Date(batchEdge.product_batches.expiry_date).toLocaleDateString('id-ID')
                                                                    : 'Tanpa Kedaluwarsa'
                                                                return (
                                                                    <div key={idx} className="flex gap-2 ml-2 items-center">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                                                        <span>Diambil <b>{batchEdge.quantity} pcs</b> dari Batch Kedaluwarsa: {expiry}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/60 border-t border-gray-100">
                                    <tr>
                                        <td colSpan={3} className="px-5 py-2.5 text-right text-xs text-gray-500">Subtotal</td>
                                        <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">
                                            {formatCurrency(order.total_amount - (order.tax || 0) + (order.discount || 0))}
                                        </td>
                                    </tr>
                                    {(order.discount > 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-2.5 text-right text-xs text-red-500">Diskon</td>
                                            <td className="px-5 py-2.5 text-right text-sm font-medium text-red-500">
                                                - {formatCurrency(order.discount)}
                                            </td>
                                        </tr>
                                    )}
                                    {(order.tax > 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-2.5 text-right text-xs text-gray-500">Pajak</td>
                                            <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(order.tax)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-t border-gray-200">
                                        <td colSpan={3} className="px-5 py-3 text-right text-sm font-bold text-gray-900">Total</td>
                                        <td className="px-5 py-3 text-right text-base font-bold text-emerald-600">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">Informasi Pembayaran</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-5">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Metode Pembayaran</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status Pembayaran</p>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[order.payment_status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                    {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Order Status */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">Status Pesanan</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status Saat Ini</p>
                                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                    {STATUS_LABELS[order.status] || order.status}
                                </span>
                            </div>
                            {order.notes && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Catatan</p>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100">
                                        {order.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">Detail Pelanggan</p>
                        </div>
                        <div className="p-5">
                            {order.customers ? (
                                <div className="space-y-3.5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                                            <User className="h-3.5 w-3.5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customers.name}</p>
                                            <p className="text-[10px] text-gray-400">Pelanggan</p>
                                        </div>
                                    </div>
                                    {order.customers.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                                                <Mail className="h-3.5 w-3.5 text-gray-500" />
                                            </div>
                                            <p className="text-sm text-gray-600 break-all self-center">{order.customers.email}</p>
                                        </div>
                                    )}
                                    {order.customers.phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                                            </div>
                                            <p className="text-sm text-gray-600 self-center">{order.customers.phone}</p>
                                        </div>
                                    )}
                                    {order.customers.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                                                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                            </div>
                                            <p className="text-sm text-gray-600">{order.customers.address}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mx-auto mb-2">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500">Pelanggan Tamu</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Tidak ada detail tersedia</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
