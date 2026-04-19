import { getSettings } from '@/app/actions/settings'
import { SettingsForm } from './settings-form-component'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengaturan</h1>
                <p className="text-sm text-gray-500 mt-0.5">Kelola konfigurasi dan preferensi toko Anda</p>
            </div>

            {/* Settings Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                        <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Konfigurasi Toko</p>
                        <p className="text-xs text-gray-400">Informasi umum dan pengaturan notifikasi</p>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <SettingsForm initialSettings={settings} />
                </div>
            </div>
        </div>
    )
}
