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
import { getDashboardStats, getDashboardCharts } from '@/app/actions/dashboard'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'

const quickActions = [
  {
    title: 'New Product',
    description: 'Add a new product to inventory',
    icon: <Plus className="h-5 w-5" />,
    href: '/admin/products',
    variant: 'default' as const
  },
  {
    title: 'New Order',
    description: 'Create a new sales order',
    icon: <ShoppingCart className="h-5 w-5" />,
    href: '/admin/orders/new',
    variant: 'outline' as const
  },
  {
    title: 'Add Customer',
    description: 'Register a new customer',
    icon: <UserPlus className="h-5 w-5" />,
    href: '/admin/customers',
    variant: 'outline' as const
  },
  {
    title: 'Inventory Report',
    description: 'Generate inventory report',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/products',
    variant: 'outline' as const
  },
]

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const chartData = await getDashboardCharts()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor</h1>
          <p className="text-gray-600 mt-1">Selamat datang! Berikut ringkasan aktivitas toko Anda hari ini.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Button>
        </div>
      </div>

      <DashboardCharts data={chartData} />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp{stats.totalRevenue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            {/* <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12.5%</span> dari bulan lalu
            </p> */}
            {/* Removed hardcoded comparison for now */}
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="text-amber-500">{stats.pendingOrders} pending</span>
              </p>
              <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline flex items-center">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stats.lowStockItems > 0 ? (
                  <span className="text-amber-500">{stats.lowStockItems} low in stock</span>
                ) : 'All items in stock'}
              </p>
              <Link href="/admin/products" className="text-xs text-blue-600 hover:underline flex items-center">
                Manage <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            {/* <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5.2%</span> from last month
            </p> */}
            <p className="text-xs text-muted-foreground">Total registered customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button variant={action.variant} className="w-full h-full p-4 flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-blue-600">{action.icon}</span>
                  <span className="font-medium">{action.title}</span>
                  <span className="text-xs text-muted-foreground font-normal">{action.description}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>Aktivitas dan notifikasi sistem terbaru</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                <span>Live</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${activity.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    {activity.type === 'order' ? (
                      <ShoppingCart className="h-4 w-4" />
                    ) : activity.type === 'product' ? (
                      <Package className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Button variant="ghost" type='button' size="icon" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
            )}

            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                View all activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Peringatan Stok</CardTitle>
              <CardDescription>Item yang membutuhkan perhatian</CardDescription>
            </div>
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{stats.lowStockItems} Alerts</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              {stats.lowStockItems > 0 ? (
                <>
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Low Stock Items</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.lowStockItems} items become low in stock (≤ 8 pcs).
                      </p>
                    </div>
                    <Link href="/admin/products" className="ml-auto">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    {stats.lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                        <span className="font-medium text-gray-700">{product.name}</span>
                        <span className="text-amber-600 font-bold">{product.stock} pcs</span>
                      </div>
                    ))}
                    {stats.lowStockItems > 5 && (
                      <p className="text-xs text-center text-muted-foreground pt-1">
                        + {stats.lowStockItems - 5} more items
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Semua stok dalam kondisi baik (› 8 pcs).</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
