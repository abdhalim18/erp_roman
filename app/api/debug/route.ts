import { getProducts } from '@/app/actions/products'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getProducts()
  return NextResponse.json(data)
}
