import { getProducts } from '@/app/actions/products'
import { getCustomersForSelect } from '@/app/actions/orders'
import { getSettings } from '@/app/actions/settings'
import { getPaymentMethods } from '@/app/actions/payment_methods'
import { getUserRole } from '@/app/actions/auth'
import POSNewOrder from './pos-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transaksi Penjualan Baru | Toko Roman',
  description: 'Buat transaksi order baru',
}

export const dynamic = 'force-dynamic'

export default async function NewOrderPage() {
  const [{ products }, { customers }, settings, { data: paymentMethods }, role] = await Promise.all([
    getProducts(),
    getCustomersForSelect(),
    getSettings(),
    getPaymentMethods(),
    getUserRole()
  ])

  // Tampilkan semua produk yang aktif (termasuk yang stoknya habis agar kasir tahu produk ada tapi kosong)
  const availableProducts = (products || []).filter(
    (p) => p.status === 'active'
  )

  const cashierName = role === 'admin' ? 'Admin' : 'Kasir'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kasir Transaksi Baru</h1>
        <p className="text-sm text-gray-500 mt-0.5">Buat data penjualan baru secara langsung</p>
      </div>

      <POSNewOrder 
        products={availableProducts} 
        customers={customers || []} 
        lowStockThreshold={settings.lowStockThreshold}
        paymentMethods={(paymentMethods || []).filter(m => m.status === 'active')}
        storeName={settings.storeName}
        storeAddress={settings.storeAddress}
        storePhone={settings.storePhone}
        cashierName={cashierName}
      />
    </div>
  )
}
