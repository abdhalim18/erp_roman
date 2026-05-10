import { ProductsClient } from './products-client'
import { getProducts } from '@/app/actions/products'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  noStore()
  const { products } = await getProducts()

  // Calculate statistics
  const totalProducts = products.length
  const lowStockItems = products.filter(p => p.stock <= p.min_stock).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

  return (
    <ProductsClient 
      initialProducts={products}
      stats={{
        totalProducts,
        lowStockItems,
        totalValue
      }}
    />
  )
}
