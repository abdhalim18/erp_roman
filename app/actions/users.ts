'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type User = {
    id: string
    email?: string
    created_at: string
    last_sign_in_at?: string
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
    )

    return { users: sortedUsers as User[], error: null }
}

export async function createUser(email: string, password: string) {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, error: null }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true, error: null }
}
