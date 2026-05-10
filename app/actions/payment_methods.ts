'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export type PaymentMethod = {
  id: string
  name: string
  is_cash: boolean
  status: 'active' | 'inactive'
}

const DATA_FILE = path.join(process.cwd(), 'data', 'payment-methods.json')

function getMethodsData(): { methods: PaymentMethod[] } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading payment methods:', error)
  }
  return { methods: [] }
}

export async function getPaymentMethods(): Promise<{ data: PaymentMethod[]; error: string | null }> {
  try {
    const data = getMethodsData()
    return { data: data.methods, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function savePaymentMethods(methods: PaymentMethod[]): Promise<{ success: boolean; error: string | null }> {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({ methods }, null, 2), 'utf8')
    revalidatePath('/admin/settings')
    revalidatePath('/admin/orders/new')
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
