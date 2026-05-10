'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  User as UserIcon,
  ShoppingCart,
  Settings,
  Truck,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react'

const menuItems = [
  { title: 'Dasbor', href: '/admin', icon: LayoutDashboard },
  { title: 'Produk', href: '/admin/products', icon: Package },
  { title: 'Kategori', href: '/admin/categories', icon: Tags },
  { title: 'Pemasok', href: '/admin/suppliers', icon: Truck },
  { title: 'Pelanggan', href: '/admin/customers', icon: Users },
  { title: 'Pengguna', href: '/admin/users', icon: UserIcon },
  { 
    title: 'Penjualan', 
    icon: ShoppingCart,
    subItems: [
      { title: 'Daftar Penjualan', href: '/admin/orders' },
      { title: 'Laporan Penjualan', href: '/admin/reports' },
      { title: 'Laporan Shift Kasir', href: '/admin/shifts' },
    ]
  },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [salesExpanded, setSalesExpanded] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  useEffect(() => {
    if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/reports') || pathname.startsWith('/admin/shifts')) {
      setSalesExpanded(true)
    }
  }, [pathname])

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-[calc(100vh-65px)] flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon

          if (item.subItems) {
            const isGroupActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
            
            return (
              <div key={item.title} className="flex flex-col space-y-1">
                <button
                  onClick={() => setSalesExpanded(!salesExpanded)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isGroupActive && !salesExpanded ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4 shrink-0', isGroupActive && !salesExpanded ? 'text-indigo-600' : 'text-gray-400')} />
                    <span>{item.title}</span>
                  </div>
                  {salesExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {salesExpanded && (
                  <div className="pl-10 pr-2 space-y-1 pb-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/')
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            'flex items-center w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                            isSubActive 
                              ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-200' 
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                          )}
                        >
                          {sub.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout & Bottom version tag */}
      <div className="px-3 py-3 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Keluar</span>
        </button>
        <p className="text-[10px] text-gray-400 text-center tracking-wide mt-1">Toko Roman - Admin</p>
      </div>
    </aside>
  )
}
