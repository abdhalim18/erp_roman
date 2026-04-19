import { getProducts, type Product } from '@/app/actions/products'
import { getCustomersForSelect } from '@/app/actions/orders'
import POSNewOrder from './pos-client'

export default async function NewOrderPage() {
  const { products } = await getProducts()
  const { customers } = await getCustomersForSelect()

  const activeProducts = (products || []).filter((p) => p.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaksi Baru</h1>
          <p className="text-gray-600 mt-2">Buat pesanan baru dari stok yang tersedia</p>
        </div>
      </div>

      <POSNewOrder products={activeProducts as Product[]} customers={customers || []} />
    </div>
  )
}
