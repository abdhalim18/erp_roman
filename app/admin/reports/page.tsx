import { getSalesReportPerProduct } from '@/app/actions/reports'
import { getPaymentMethods } from '@/app/actions/payment_methods'
import { ReportsClient } from './reports-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Laporan Penjualan | Toko Roman',
  description: 'Laporan analitik penjualan harian dan bulanan',
}

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [{ data: reports, error }, { data: paymentMethods }] = await Promise.all([
    getSalesReportPerProduct(),
    getPaymentMethods()
  ])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-red-500 font-medium">Gagal memuat data laporan</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    )
  }

  return <ReportsClient initialReports={reports || []} paymentMethods={paymentMethods || []} />
}
