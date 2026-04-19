import CustomerClientWrapper from './customer-client-wrapper'
import { getCustomers } from '@/app/actions/customers'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CashierCustomersPage() {
    const { customers } = await getCustomers()

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
                                customers?.map((customer) => (
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
            </div>
        </div>
    )
}
