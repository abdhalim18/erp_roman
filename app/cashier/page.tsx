import { getProducts, type Product } from '@/app/actions/products'
import { getCustomersForSelect } from '@/app/actions/orders'
import { getPaymentMethods } from '@/app/actions/payment_methods'
import { getSettings } from '@/app/actions/settings'
import { getUserRole } from '@/app/actions/auth'
import { getActiveShifts } from '@/app/actions/shifts'
import POSNewOrder from '@/app/admin/orders/new/pos-client'
import { CalendarDays, ShieldAlert, PlayCircle } from 'lucide-react'
import Link from 'next/link'

export default async function CashierPage() {
  const [{ products }, { customers }, { data: paymentMethods }, settings, role, { shifts: activeShifts }] = await Promise.all([
    getProducts(),
    getCustomersForSelect(),
    getPaymentMethods(),
    getSettings(),
    getUserRole(),
    getActiveShifts()
  ])

  const activeProducts = (products || []).filter((p) => p.status === 'active')

  const cashierName = role === 'admin' ? 'Admin' : 'Kasir'

  // Admin bisa langsung transaksi tanpa shift, kasir harus buka shift dulu
  const hasActiveShift = role === 'admin' || activeShifts.length > 0

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

      {hasActiveShift ? (
        <POSNewOrder
          products={activeProducts as Product[]}
          customers={customers || []}
          paymentMethods={(paymentMethods || []).filter(m => m.status === 'active')}
          lowStockThreshold={settings.lowStockThreshold}
          storeName={settings.storeName}
          storeAddress={settings.storeAddress}
          storePhone={settings.storePhone}
          cashierName={cashierName}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm mb-6">
              <ShieldAlert className="h-10 w-10 text-amber-600" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-sm">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shift Belum Dibuka</h2>
          <p className="text-sm text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
            Anda harus membuka shift terlebih dahulu sebelum dapat memproses transaksi. Silakan buka shift untuk memulai.
          </p>
          <Link
            href="/cashier/shift"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <PlayCircle className="h-4 w-4" />
            Buka Shift Sekarang
          </Link>
        </div>
      )}
    </div>
  )
}