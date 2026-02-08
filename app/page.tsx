import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role === 'cashier') {
    redirect('/cashier')
  } else {
    redirect('/admin')
  }
}