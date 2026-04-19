import { getProducts, type Product } from '@/app/actions/products'
import { getCustomersForSelect } from '@/app/actions/orders'
import POSNewOrder from '@/app/admin/orders/new/pos-client'
import { CalendarDays } from 'lucide-react'

export default async function CashierPage() {
  const { products } = await getProducts()
  const { customers } = await getCustomersForSelect()

  const activeProducts = (products || []).filter((p) => p.status === 'active')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transaksi Baru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pilih produk dan proses pembayaran pelanggan.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-100 shadow-sm px-3 py-2 rounded-lg self-start sm:self-auto">
          <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-medium text-gray-700">
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </span>
        </div>
      </div>

      <POSNewOrder
        products={activeProducts as Product[]}
        customers={customers || []}
      />
    </div>
  )
}