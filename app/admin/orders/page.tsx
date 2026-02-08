import { getOrders } from '@/app/actions/orders'
import { OrdersClient } from './orders-client'

export default async function OrdersPage() {
  const { orders } = await getOrders()

  return <OrdersClient initialOrders={orders || []} />
}
