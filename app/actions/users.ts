'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type User = {
    id: string
    email?: string
    created_at: string
    last_sign_in_at?: string
    role: 'admin' | 'cashier'
    pin?: string
}

export async function getUsers() {
    const supabase = createAdminClient()
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return { users: [], error: error.message }
    }

    // Sort by created_at desc
    const sortedUsers = users.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: (u.user_metadata?.role || 'admin') as 'admin' | 'cashier',
        pin: u.user_metadata?.pin || '1234'
    }))

    return { users: sortedUsers, error: null }
}

export async function createUser(email: string, password: string, role: string, pin: string = '1234') {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, pin }
    })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, error: null }
}

export async function deleteUser(userId: string) {
    // Cek apakah user yang akan dihapus adalah user yang sedang login
    const supabaseAuth = await createClient()
    const { data: { user: currentUser } } = await supabaseAuth.auth.getUser()

    if (currentUser && currentUser.id === userId) {
        return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, error: null }
}

export async function updateUser(userId: string, data: { password?: string; role?: string; pin?: string }) {
    const supabase = createAdminClient()

    const updatePayload: { password?: string; user_metadata?: { role?: string; pin?: string } } = {}

    if (data.password && data.password.length >= 6) {
        updatePayload.password = data.password
    }

    if (data.role || data.pin) {
        updatePayload.user_metadata = {}
        if (data.role) updatePayload.user_metadata.role = data.role
        if (data.pin) updatePayload.user_metadata.pin = data.pin
    }

    if (Object.keys(updatePayload).length === 0) {
        return { success: false, error: 'Tidak ada perubahan yang disimpan' }
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, updatePayload)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, error: null }
}
