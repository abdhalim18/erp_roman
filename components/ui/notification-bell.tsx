'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getExpiringBatches, type ExpiringBatch } from '@/app/actions/dashboard'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<ExpiringBatch[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const expiring = await getExpiringBatches(30)
                setNotifications(expiring || [])
            } catch (error) {
                console.error("Failed to fetch expiring batches", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()

        // 1. Polling secara otomatis setiap 30 detik
        const intervalId = setInterval(fetchNotifications, 30000)

        // 2. Refetch otomatis setiap kali pengguna kembali ke tab browser ini
        const handleFocus = () => fetchNotifications()
        window.addEventListener('focus', handleFocus)

        return () => {
            clearInterval(intervalId)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    if (loading) {
        return (
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                <Bell className="h-4 w-4 text-gray-500" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-gray-100">
                    <Bell className="h-4 w-4 text-gray-700" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                            {notifications.length > 99 ? '99+' : notifications.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-gray-100 shadow-lg">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                    <span className="font-semibold text-gray-900">Notifikasi Kedaluwarsa</span>
                    {notifications.length > 0 && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                            {notifications.length} PERINGATAN
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center">
                            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <Bell className="h-4 w-4 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Tidak ada notifikasi</p>
                            <p className="text-xs text-gray-500 mt-0.5">Semua stok terpantau aman.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-50">
                            {notifications.map((batch) => (
                                <div key={batch.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        batch.days_to_expiry <= 0 ? 'bg-red-50 text-red-600' : 
                                        batch.days_to_expiry <= 14 ? 'bg-orange-50 text-orange-600' : 
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight">
                                            {batch.product_name}
                                        </p>
                                        <div className="flex flex-col text-xs text-gray-500 gap-0.5">
                                            <span>Sisa stok: <span className="font-medium text-gray-700">{batch.quantity} item</span></span>
                                            <span className={`font-medium ${
                                                batch.days_to_expiry <= 0 ? 'text-red-600' : 
                                                batch.days_to_expiry <= 14 ? 'text-orange-600' : 
                                                'text-amber-600'
                                            }`}>
                                                {batch.days_to_expiry <= 0 
                                                    ? `Basi sejak ${new Date(batch.expiry_date).toLocaleDateString('id-ID')}`
                                                    : batch.days_to_expiry <= 14
                                                    ? `Tidak Layak Jual (H-${batch.days_to_expiry}) - ${new Date(batch.expiry_date).toLocaleDateString('id-ID')}`
                                                    : `Kedaluwarsa dalam ${batch.days_to_expiry} hari (${new Date(batch.expiry_date).toLocaleDateString('id-ID')})`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-2 bg-gray-50/50 border-t border-gray-100">
                        <Button variant="ghost" className="w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                            <a href="/admin/products">Kelola Stok Produk &rarr;</a>
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
