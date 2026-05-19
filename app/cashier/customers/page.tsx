import CustomerClientWrapper from './customer-client-wrapper'
import { getCustomers } from '@/app/actions/customers'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CashierCustomersPage({ searchParams }: { searchParams?: { page?: string } }) {
    const page = parseInt(searchParams?.page || '1', 10)
    const ITEMS_PER_PAGE = 20

    const { customers } = await getCustomers()
    const totalPages = Math.ceil((customers?.length || 0) / ITEMS_PER_PAGE)
    const displayCustomers = (customers || []).slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    )

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pelanggan</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Data pelanggan member terdaftar.</p>
                </div>
                <CustomerClientWrapper />
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Daftar Pelanggan</p>
                    <span className="text-xs text-gray-400">{customers?.length || 0} pelanggan</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No. Telepon</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Alamat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Users className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Belum ada data pelanggan</p>
                                            <p className="text-xs mt-1">Tambahkan pelanggan pertama Anda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayCustomers?.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-gray-900">{customer.name}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{customer.phone || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{customer.email || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-400 truncate max-w-xs">{customer.address || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 print:hidden">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{((page - 1) * ITEMS_PER_PAGE) + 1}</span> hingga{' '}
                            <span className="font-medium text-gray-900">{Math.min(page * ITEMS_PER_PAGE, customers?.length || 0)}</span> dari{' '}
                            <span className="font-medium text-gray-900">{customers?.length || 0}</span> pelanggan
                        </p>
                        <div className="flex gap-2">
                            {page > 1 ? (
                                <Link href={`/cashier/customers?page=${page - 1}`}>
                                    <Button variant="outline" size="sm">Sebelumnya</Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
                            )}
                            {page < totalPages ? (
                                <Link href={`/cashier/customers?page=${page + 1}`}>
                                    <Button variant="outline" size="sm">Selanjutnya</Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="sm" disabled>Selanjutnya</Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
