import { getAllShifts } from '@/app/actions/shifts'
import { Clock, Download, FileText } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminShiftsPage({ searchParams }: { searchParams?: { filter?: string } }) {
    const filter = searchParams?.filter || 'all'
    const { shifts } = await getAllShifts(100)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const filteredShifts = (shifts || []).filter(shift => {
        const shiftDate = new Date(shift.opened_at)
        if (filter === 'daily') {
            return shiftDate >= today
        } else if (filter === 'weekly') {
            return shiftDate >= weekAgo
        }
        return true
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Laporan Shift Kasir</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Pemantauan aktivitas buka/tutup shift dari seluruh kasir.</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded-lg p-1 self-start sm:self-auto shadow-sm">
                    <Link 
                        href="/admin/shifts" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Semua
                    </Link>
                    <Link 
                        href="/admin/shifts?filter=daily" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'daily' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Hari Ini
                    </Link>
                    <Link 
                        href="/admin/shifts?filter=weekly" 
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'weekly' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                    >
                        Minggu Ini
                    </Link>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Daftar Shift {filter === 'daily' ? 'Hari Ini' : filter === 'weekly' ? 'Minggu Ini' : 'Terbaru'}</p>
                    <span className="text-xs text-gray-400">{filteredShifts.length} shift ditampilkan</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kasir</th>
                                <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Waktu Buka & Tutup</th>
                                <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Modal Awal</th>
                                <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Penjualan Sistem</th>
                                <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Uang Fisik Akhir</th>
                                <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Selisih</th>
                                <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredShifts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Clock className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Belum ada data shift {filter === 'daily' ? 'hari ini' : filter === 'weekly' ? 'minggu ini' : ''}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredShifts.map((shift) => {
                                    const expectedCash = shift.opening_balance + (shift.total_cash_sales || 0)
                                    const actualCash = shift.closing_balance || 0
                                    const difference = actualCash - expectedCash

                                    return (
                                        <tr key={shift.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {shift.cashier_email.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-900">{shift.cashier_email.split('@')[0]}</p>
                                                        <p className="text-[10px] text-gray-400">{shift.cashier_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        {new Date(shift.opened_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                    {shift.closed_at ? (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1.5 pl-3 border-l-2 border-gray-100 ml-0.5">
                                                            {new Date(shift.closed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 pl-3 border-l-2 border-gray-100 ml-0.5 italic">Belum ditutup</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-medium text-gray-600 text-xs">
                                                {formatRupiah(shift.opening_balance)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-semibold">{formatRupiah(shift.total_cash_sales || 0)} <span className="text-[10px] text-gray-400 font-normal">Tunai</span></span>
                                                    <span className="text-gray-500">{formatRupiah(shift.total_noncash_sales || 0)} <span className="text-[10px] text-gray-400">Non-Tunai</span></span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-gray-900 text-xs">
                                                {shift.status === 'closed' ? formatRupiah(actualCash) : '-'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-xs">
                                                {shift.status === 'closed' ? (
                                                    <span className={`font-semibold ${difference === 0 ? 'text-emerald-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        {difference > 0 ? '+' : ''}{formatRupiah(difference)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${shift.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {shift.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
