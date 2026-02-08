import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'
import { getSettings } from '@/app/actions/settings'
import { CashierHeader } from '@/components/cashier/cashier-header'

import { CashierSidebar } from '@/components/cashier/cashier-sidebar'

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  const settings = await getSettings()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierHeader user={user} storeName={settings.storeName} />
      <div className="flex">
        <CashierSidebar />
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}