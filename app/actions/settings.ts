'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type AppSettings = {
    storeName: string
    storeAddress?: string
    storePhone?: string
    lowStockThreshold: number
    alertEmail?: string
}

const DEFAULT_SETTINGS: AppSettings = {
    storeName: 'Toko Roman',
    storeAddress: '',
    storePhone: '',
    lowStockThreshold: 8,
    alertEmail: '',
}

// Migrated to use 'settings' table directly
export async function getSettings(): Promise<AppSettings> {
    const supabase = createAdminClient()

    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            // IF table exists but is empty, return default or create
            if (error.code === 'PGRST116') {
                // Initial creation if not exists
                const { data: newSettings, error: createError } = await supabase
                    .from('settings')
                    .insert([{
                        store_name: DEFAULT_SETTINGS.storeName,
                        store_address: DEFAULT_SETTINGS.storeAddress,
                        store_phone: DEFAULT_SETTINGS.storePhone,
                        low_stock_threshold: DEFAULT_SETTINGS.lowStockThreshold,
                        alert_email_recipient: DEFAULT_SETTINGS.alertEmail
                    }])
                    .select()
                    .single()

                if (createError) {
                    console.error('Failed to create initial settings:', createError)
                    return DEFAULT_SETTINGS
                }
                return {
                    storeName: newSettings.store_name,
                    storeAddress: newSettings.store_address || undefined,
                    storePhone: newSettings.store_phone || undefined,
                    lowStockThreshold: newSettings.low_stock_threshold,
                    alertEmail: newSettings.alert_email_recipient || undefined
                }
            }
            console.error('Error fetching settings:', error)
            return DEFAULT_SETTINGS
        }

        return {
            storeName: data.store_name,
            storeAddress: data.store_address || undefined,
            storePhone: data.store_phone || undefined,
            lowStockThreshold: data.low_stock_threshold,
            alertEmail: data.alert_email_recipient || undefined
        }
    } catch (e) {
        console.error('Unexpected error fetching settings:', e)
        return DEFAULT_SETTINGS
    }
}

export async function updateSettings(newSettings: Partial<AppSettings>) {
    try {
        const supabase = createAdminClient()

        // Get current settings first to merge, though UI sends all fields usually
        // Actually for this simple table we can just update the single row

        // Map to DB columns
        const dbUpdate: any = {}
        if (newSettings.storeName !== undefined) dbUpdate.store_name = newSettings.storeName
        if (newSettings.storeAddress !== undefined) dbUpdate.store_address = newSettings.storeAddress
        if (newSettings.storePhone !== undefined) dbUpdate.store_phone = newSettings.storePhone
        if (newSettings.lowStockThreshold !== undefined) dbUpdate.low_stock_threshold = newSettings.lowStockThreshold
        if (newSettings.alertEmail !== undefined) dbUpdate.alert_email_recipient = newSettings.alertEmail

        dbUpdate.updated_at = new Date().toISOString()

        // We assume there is only 1 row, using valid ID or just updating any row?
        // Safest is to fetch ID first, or just update where id is not null (if we knew id)
        // Since we enforced one_row_only, there is only one row.
        // But we need a WHERE clause for update. 
        // Let's fetch the single row ID first.

        const { data: existing } = await supabase.from('settings').select('id').limit(1).single()

        let error
        if (existing) {
            const res = await supabase.from('settings').update(dbUpdate).eq('id', existing.id)
            error = res.error
        } else {
            // Insert if somehow missing
            const res = await supabase.from('settings').insert([dbUpdate])
            error = res.error
        }

        if (error) {
            console.error('Update settings DB error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/settings')
        return { success: true, error: null }
    } catch (error: any) {
        console.error('Update settings error:', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}
