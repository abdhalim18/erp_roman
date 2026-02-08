import CustomerClientWrapper from './customer-client-wrapper'
import { getCustomers } from '@/app/actions/customers'

export const dynamic = 'force-dynamic'

export default async function CashierCustomersPage() {
    const { customers } = await getCustomers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Daftar Pelanggan</h2>
                    <p className="text-gray-500">Kelola data pelanggan member.</p>
                </div>
                <CustomerClientWrapper />
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nama</th>
                            <th className="px-4 py-3 font-medium">No. Telepon</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Alamat</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {customers?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    Belum ada data pelanggan.
                                </td>
                            </tr>
                        ) : (
                            customers?.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{customer.phone || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{customer.email || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{customer.address || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
