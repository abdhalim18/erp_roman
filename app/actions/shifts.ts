'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Shift = {
  id: string
  cashier_id: string
  cashier_email: string
  opened_at: string
  closed_at: string | null
  opening_balance: number
  closing_balance: number | null
  total_cash_sales: number
  total_noncash_sales: number
  notes: string | null
  status: 'open' | 'closed'
}

/** Ambil daftar shift yang sedang aktif (status = 'open') untuk user yang login */
export async function getActiveShifts(): Promise<{ shifts: Shift[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { shifts: [], error: 'Tidak terautentikasi' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('shifts')
    .select('*')
    .eq('cashier_id', user.id)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })

  if (error) {
    return { shifts: [], error: error.message }
  }

  return { shifts: (data as Shift[]) || [], error: null }
}

/** Ambil histori shift terbaru */
export async function getShiftHistory(limit = 10): Promise<{ shifts: Shift[]; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { shifts: [], error: 'Tidak terautentikasi' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('shifts')
    .select('*')
    .eq('cashier_id', user.id)
    .order('opened_at', { ascending: false })
    .limit(limit)

  if (error) return { shifts: [], error: error.message }
  return { shifts: (data as Shift[]) || [], error: null }
}

/** Hitung total penjualan selama shift aktif dari tabel orders */
export async function getShiftSales(openedAt: string): Promise<{ cash: number; nonCash: number }> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('orders')
    .select('total_amount, payment_method')
    .eq('status', 'completed')
    .gte('created_at', openedAt)

  let cash = 0
  let nonCash = 0
  for (const order of data || []) {
    if (order.payment_method === 'cash') {
      cash += order.total_amount || 0
    } else {
      nonCash += order.total_amount || 0
    }
  }

  return { cash, nonCash }
}

/** Buka shift baru (User bisa memiliki lebih dari 1 shift aktif berdasarkan feedback terbaru) */
export async function openShift(
  openingBalance: number,
  notes?: string
): Promise<{ success: boolean; shift?: Shift; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi' }

  // Berdasarkan feedback: "bisa punya lebih dari satu shift tanpa tutup shift dulu"
  // Jadi cek shift tidak melakukan block (dihapus).

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('shifts')
    .insert([{
      cashier_id: user.id,
      cashier_email: user.email || 'unknown',
      opening_balance: openingBalance,
      notes: notes || null,
      status: 'open',
    }])
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/cashier/shift')
  return { success: true, shift: data as Shift }
}

/** Tutup shift aktif */
export async function closeShift(
  shiftId: string,
  closingBalance: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi' }

  // Ambil total penjualan selama shift
  const { data: shiftData } = await createAdminClient()
    .from('shifts')
    .select('opened_at')
    .eq('id', shiftId)
    .single()

  const openedAt = shiftData?.opened_at || new Date().toISOString()
  const { cash, nonCash } = await getShiftSales(openedAt)

  const admin = createAdminClient()
  const { error } = await admin
    .from('shifts')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      closing_balance: closingBalance,
      total_cash_sales: cash,
      total_noncash_sales: nonCash,
      notes: notes || null,
    })
    .eq('id', shiftId)
    .eq('cashier_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/cashier/shift')
  return { success: true }
}
