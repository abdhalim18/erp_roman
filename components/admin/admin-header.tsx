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

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-600">Toko Roman</h1>
          <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(user.email || 'AD')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
