import { getProducts, type Product } from '@/app/actions/products'
import { getCustomersForSelect } from '@/app/actions/orders'
// PERHATIKAN: Import Default (TANPA kurung kurawal)
import POSNewOrder from '@/app/admin/orders/new/pos-client' 

export default async function CashierPage() {
  const { products } = await getProducts()
  const { customers } = await getCustomersForSelect()

  const activeProducts = (products || []).filter((p) => p.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Transaksi Baru</h2>
          <p className="text-gray-500">Pilih produk dan proses pembayaran pelanggan.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-md shadow-sm border">
            Tanggal: <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
        </div>
      </div>

      <POSNewOrder 
        products={activeProducts as Product[]} 
        customers={customers || []} 
      />
    </div>
  )
}