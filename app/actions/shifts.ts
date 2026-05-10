'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

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
  noStore()
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
  noStore()
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

/** Ambil semua histori shift dari semua kasir untuk Admin */
export async function getAllShifts(limit = 50): Promise<{ shifts: Shift[]; error: string | null }> {
  noStore()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('shifts')
    .select('*')
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

  // Ambil data payment methods untuk mengecek mana yang is_cash
  const { getPaymentMethods } = await import('@/app/actions/payment_methods')
  const { data: pmData } = await getPaymentMethods()
  
  const cashMethods = new Set((pmData || []).filter(pm => pm.is_cash).map(pm => pm.id))
  // Default fallback: kalau stringnya 'cash' anggap tunai
  cashMethods.add('cash')

  let cash = 0
  let nonCash = 0
  for (const order of data || []) {
    if (order.payment_method && cashMethods.has(order.payment_method)) {
      cash += order.total_amount || 0
    } else if (!order.payment_method) {
      // Jika null, fallback ke cash (legacy support)
      cash += order.total_amount || 0
    } else {
      nonCash += order.total_amount || 0
    }
  }

  return { cash, nonCash }
}

/** Buka shift baru (Harus tutup shift aktif terlebih dahulu sebelum buka baru) */
export async function openShift(
  openingBalance: number,
  notes?: string
): Promise<{ success: boolean; shift?: Shift; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tidak terautentikasi' }

  const admin = createAdminClient()

  // Cek apakah user masih memiliki shift yang sedang terbuka
  const { data: activeShifts, error: checkError } = await admin
    .from('shifts')
    .select('id')
    .eq('cashier_id', user.id)
    .eq('status', 'open')

  if (checkError) return { success: false, error: checkError.message }
  if (activeShifts && activeShifts.length > 0) {
    return { success: false, error: 'Anda masih memiliki shift yang sedang aktif. Silakan tutup terlebih dahulu.' }
  }

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
  revalidatePath('/admin/shifts')
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
  const { error, count } = await admin
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

  // Verifikasi bahwa baris benar-benar diupdate
  // Jika 0 baris terupdate, berarti shiftId tidak ditemukan atau cashier_id tidak cocok
  const { data: verify } = await admin
    .from('shifts')
    .select('status')
    .eq('id', shiftId)
    .single()

  if (!verify || verify.status !== 'closed') {
    return { success: false, error: 'Gagal menutup shift. Pastikan shift ini milik akun Anda.' }
  }

  revalidatePath('/cashier/shift')
  revalidatePath('/admin/shifts')
  return { success: true }
}
