import { getSettings } from '@/app/actions/settings'
import { getPaymentMethods } from '@/app/actions/payment_methods'
import { SettingsForm } from './settings-form-component'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
    title: 'Pengaturan ERP | Toko Roman',
    description: 'Konfigurasi sistem, profil, dan hak akses',
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const settings = await getSettings()
    const { data: paymentMethods } = await getPaymentMethods()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengaturan Sistem Dasar</h1>
                <p className="text-sm text-gray-500 mt-0.5">Kelola parameter operasional, informasi kontak, dan sistem keamanan ERP Anda.</p>
            </div>

            {/* Form Logic holds the Tabs Layout */}
            <SettingsForm 
                initialSettings={settings} 
                user={user} 
                initialPaymentMethods={paymentMethods || []} 
            />
        </div>
    )
}
