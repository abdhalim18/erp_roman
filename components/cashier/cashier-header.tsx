'use client'

import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'

interface CashierHeaderProps {
  user: User
  storeName: string
}

export function CashierHeader({ user, storeName }: CashierHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-indigo-600">{storeName}</h1>
          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
            Mode Kasir
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Halo, {user.email?.split('@')[0]}</p>
            <p className="text-xs text-gray-500">Siap melayani</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-indigo-600 text-white">
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}