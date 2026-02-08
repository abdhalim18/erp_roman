'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    History,
    ClipboardList,
    Search,
    Users,
} from 'lucide-react'

const menuItems = [
    {
        title: 'Transaksi',
        href: '/cashier',
        icon: LayoutDashboard,
    },
    {
        title: 'Riwayat',
        href: '/cashier/history',
        icon: History,
    },
    {
        title: 'Laporan Shift',
        href: '/cashier/shift',
        icon: ClipboardList,
    },
    {
        title: 'Cek Stok',
        href: '/cashier/products',
        icon: Search,
    },
    {
        title: 'Pelanggan',
        href: '/cashier/customers',
        icon: Users,
    },
]

export function CashierSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] hidden md:block">
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
