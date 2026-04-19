'use server'

import { createClient } from '@/lib/supabase/server'

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Ambil peran pengguna yang sedang login.
 * Role disimpan di user_metadata.role saat pembuatan akun.
 * Default ke 'admin' jika tidak ada (untuk backward compatibility).
 */
export async function getUserRole(): Promise<'admin' | 'cashier'> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'cashier'
  return (user.user_metadata?.role || 'admin') as 'admin' | 'cashier'
}
