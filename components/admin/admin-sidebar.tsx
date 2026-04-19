'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  User as UserIcon,
  ShoppingCart,
  Settings,
  Truck,
} from 'lucide-react'

const menuItems = [
  { title: 'Dasbor', href: '/admin', icon: LayoutDashboard },
  { title: 'Produk', href: '/admin/products', icon: Package },
  { title: 'Kategori', href: '/admin/categories', icon: Tags },
  { title: 'Pemasok', href: '/admin/suppliers', icon: Truck },
  { title: 'Pelanggan', href: '/admin/customers', icon: Users },
  { title: 'Pengguna', href: '/admin/users', icon: UserIcon },
  { title: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-[calc(100vh-65px)] flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Bottom version tag */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center tracking-wide">Toko Roman - Admin</p>
      </div>
    </aside>
  )
}
