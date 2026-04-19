import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { RealtimeStockAlert } from '@/components/admin/realtime-stock-alert'
import { getSettings } from '@/app/actions/settings'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RBAC: Hanya admin yang boleh akses halaman /admin/*
  const userRole = user.user_metadata?.role || 'admin'
  if (userRole !== 'admin') {
    redirect('/cashier')
  }

  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <RealtimeStockAlert threshold={settings.lowStockThreshold || 8} />
      <div className="print:hidden">
        <AdminHeader user={user} />
      </div>
      <div className="flex">
        <div className="print:hidden">
          <AdminSidebar />
        </div>
        <main className="flex-1 p-8 print:p-0 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
