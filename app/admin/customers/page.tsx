import { CustomersClient } from './customers-client'
import { getCustomers } from '@/app/actions/customers'

export default async function CustomersPage() {
  const { customers } = await getCustomers()

  // Calculate statistics
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  
  return (
    <CustomersClient
      initialCustomers={customers}
      stats={{
        totalCustomers,
        activeCustomers,
      }}
    />
  )
}
