'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    History,
    ClipboardList,
    Search,
    Users,
    LogOut,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

const menuItems = [
    { title: 'Transaksi', href: '/cashier', icon: LayoutDashboard },
    { title: 'Riwayat', href: '/cashier/history', icon: History },
    { title: 'Laporan Shift', href: '/cashier/shift', icon: ClipboardList },
    { title: 'Cek Stok', href: '/cashier/products', icon: Search },
    { title: 'Pelanggan', href: '/cashier/customers', icon: Users },
]

export function CashierSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="w-60 bg-white border-r border-gray-100 min-h-[calc(100vh-65px)] hidden md:flex flex-col">
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
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            )}
                        >
                            <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
                            <span>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="px-3 py-3 border-t border-gray-100 flex flex-col gap-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors w-full text-left"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Keluar</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center tracking-wide mt-1">Toko Roman · Kasir</p>
            </div>
        </aside>
    )
}
