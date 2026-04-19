import { createProduct } from '@/app/actions/products'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const formData = new FormData()
    formData.append('name', 'Test Product')
    formData.append('description', 'Test Description')
    formData.append('category_id', 'none')
    formData.append('kode_produk', 'TEST-002')
    formData.append('price', '1000')
    formData.append('cost', '500')
    formData.append('stock', '1')
    formData.append('min_stock', '1')
    formData.append('unit', 'unit')
    formData.append('status', 'active')
    formData.append('expiry_date', '2025-01-01')
    
    const result = await createProduct(formData)
    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.toString(), stack: err.stack })
  }
}
