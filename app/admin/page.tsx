import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  Plus,
  FileText,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  UserPlus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, getDashboardCharts, getExpiringBatches } from '@/app/actions/dashboard'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { Clock } from 'lucide-react'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

const quickActions = [
  {
    title: 'Produk Baru',
    description: 'Tambah produk ke inventaris',
    icon: <Plus className="h-5 w-5" />,
    href: '/admin/products',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  {
    title: 'Penjualan Baru',
    description: 'Buat transaksi penjualan baru',
    icon: <ShoppingCart className="h-5 w-5" />,
    href: '/admin/orders/new',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  {
    title: 'Tambah Pelanggan',
    description: 'Daftar pelanggan baru',
    icon: <UserPlus className="h-5 w-5" />,
    href: '/admin/customers',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    title: 'Laporan Inventaris',
    description: 'Buat laporan inventaris',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/products',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
]

export default async function AdminDashboard() {
  noStore()
  const stats = await getDashboardStats()
  const chartData = await getDashboardCharts()
  const expiringBatches = await getExpiringBatches(30)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dasbor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Berikut ringkasan aktivitas toko Anda hari ini.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start md:self-auto text-gray-600 border-gray-200 hover:bg-gray-50">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-xs">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pendapatan</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                Rp{stats.totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-xs text-gray-400">Diperbarui baru saja</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-indigo-50 opacity-60" />
        </div>

        {/* Orders Card */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Penjualan</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{stats.totalOrders}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-amber-500 font-medium">{stats.pendingOrders} tertunda</span>
                <Link href="/admin/orders" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
                  Lihat <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-violet-50 opacity-60" />
        </div>

        {/* Products Card */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Produk</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{stats.totalProducts}</p>
              <div className="mt-1 flex items-center gap-2">
                {stats.lowStockItems > 0 ? (
                  <span className="text-xs text-amber-500 font-medium">{stats.lowStockItems} stok menipis</span>
                ) : (
                  <span className="text-xs text-emerald-500 font-medium">Semua tersedia</span>
                )}
                <Link href="/admin/products" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
                  Kelola <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-emerald-50 opacity-60" />
        </div>

        {/* Customers Card */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pelanggan</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="mt-1 text-xs text-gray-400">Terdaftar di sistem</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-amber-50 opacity-60" />
        </div>
      </div>

      {/* Chart */}
      <DashboardCharts data={chartData} />

      {/* Quick Actions + Recent Activities */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <Card className="lg:col-span-3 border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">Aksi Cepat</CardTitle>
            <CardDescription className="text-xs">Aksi yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className={`group flex flex-col items-start gap-2.5 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                    <span className="text-white">{action.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{action.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-4 border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-800">Aktivitas Terbaru</CardTitle>
                <CardDescription className="text-xs">Aktivitas dan notifikasi sistem terbaru</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 text-[10px] px-2 py-0.5 border-emerald-200 text-emerald-600 bg-emerald-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.status === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : activity.status === 'success'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-blue-100 text-blue-600'
                    }`}>
                    {activity.type === 'order' ? (
                      <ShoppingCart className="h-3.5 w-3.5" />
                    ) : activity.type === 'product' ? (
                      <Package className="h-3.5 w-3.5" />
                    ) : (
                      <Users className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{activity.description}</p>
                    <p className="text-[10px] text-gray-400">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">Tidak ada aktivitas terbaru</p>
            )}
            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-blue-500 hover:text-blue-700 h-7">
                Lihat semua aktivitas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Row */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Inventory Alerts */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-800">Peringatan Stok</CardTitle>
                <CardDescription className="text-xs">Item yang membutuhkan perhatian</CardDescription>
              </div>
              <Badge className={`gap-1 text-[10px] px-2 py-0.5 ${stats.lowStockItems > 0 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'} border`}>
                <AlertTriangle className="h-3 w-3" />
                {stats.lowStockItems} Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockItems > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-800">Stok Menipis & Habis</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">{stats.lowStockItems} item stoknya menipis atau habis (≤ {stats.lowStockThreshold} pcs).</p>
                  </div>
                  <Link href="/admin/products">
                    <Button variant="outline" size="sm" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-100">
                      Kelola
                    </Button>
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {stats.lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-700">{product.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${product.stock <= 0 ? 'text-red-600 bg-red-50' : 'text-amber-500 bg-amber-50'}`}>
                        {product.stock <= 0 ? 'Habis' : `${product.stock} pcs`}
                      </span>
                    </div>
                  ))}
                  {stats.lowStockItems > 5 && (
                    <p className="text-[10px] text-center text-gray-400 pt-1">+ {stats.lowStockItems - 5} item lainnya</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-xs font-medium text-gray-600">Stok Aman</p>
                <p className="text-[10px] text-gray-400 mt-1">Semua stok dalam kondisi baik (› {stats.lowStockThreshold} pcs).</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiration Alerts */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-800">Peringatan Kedaluwarsa</CardTitle>
                <CardDescription className="text-xs">Stok yang akan kedaluwarsa</CardDescription>
              </div>
              <Badge className={`gap-1 text-[10px] px-2 py-0.5 ${expiringBatches.length > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'} border`}>
                <Clock className="h-3 w-3" />
                {expiringBatches.length} Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {expiringBatches.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Clock className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-800">Akan Kedaluwarsa</p>
                    <p className="text-[10px] text-red-600 mt-0.5">{expiringBatches.length} batch akan rusak dalam jadwal terdekat.</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {expiringBatches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">{batch.product_name}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(batch.expiry_date).toLocaleDateString('id-ID')} · {batch.quantity} {batch.kode_produk}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        batch.days_to_expiry <= 0 ? 'bg-red-50 text-red-600' :
                        batch.days_to_expiry <= 14 ? 'bg-orange-50 text-orange-600' :
                        'bg-amber-50 text-amber-600'
                        }`}>
                        {batch.days_to_expiry <= 0 ? 'Basi' : `H-${batch.days_to_expiry}`}
                      </span>
                    </div>
                  ))}
                  {expiringBatches.length > 5 && (
                    <p className="text-[10px] text-center text-gray-400 pt-1">+ {expiringBatches.length - 5} batch lainnya</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-xs font-medium text-gray-600">Aman!</p>
                <p className="text-[10px] text-gray-400 mt-1">Tidak ada barang yang segera basi.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
