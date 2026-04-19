'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Store, MapPin, Phone, AlertTriangle, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings, type AppSettings } from '@/app/actions/settings'

const settingsSchema = z.object({
    storeName: z.string().min(2, { message: 'Nama toko minimal 2 karakter.' }),
    storeAddress: z.string().optional(),
    storePhone: z.string().optional(),
    lowStockThreshold: z.number().min(1, { message: 'Threshold minimal 1.' }),
    alertEmail: z.string().email().optional().or(z.literal('')),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    initialSettings: AppSettings
}

const fields = [
    {
        id: 'storeName',
        label: 'Nama Toko',
        placeholder: 'Toko Roman',
        hint: 'Nama yang akan ditampilkan di toko Anda.',
        icon: Store,
    },
    {
        id: 'storeAddress',
        label: 'Alamat Toko',
        placeholder: 'Jl. Raya No. 1...',
        hint: null,
        icon: MapPin,
    },
    {
        id: 'storePhone',
        label: 'Nomor Telepon / WA',
        placeholder: '08xxxxxxxxxx',
        hint: null,
        icon: Phone,
    },
    {
        id: 'alertEmail',
        label: 'Email Peringatan',
        placeholder: 'admin@example.com',
        hint: 'Email untuk menerima notifikasi stok menipis.',
        icon: Mail,
    },
]

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: initialSettings,
    })

    async function onSubmit(data: SettingsFormValues) {
        setLoading(true)
        try {
            const result = await updateSettings(data)
            if (result.success) {
                toast.success('Pengaturan berhasil diperbarui')
            } else {
                toast.error('Gagal memperbarui pengaturan: ' + result.error)
            }
        } catch {
            toast.error('Terjadi kesalahan yang tidak terduga')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {/* Regular fields */}
            {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={field.id} className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {field.label}
                    </Label>
                    <div className="relative">
                        <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id={field.id}
                            placeholder={field.placeholder}
                            className="pl-10 h-11 rounded-xl bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                            {...register(field.id as any)}
                        />
                    </div>
                    {field.hint && (
                        <p className="text-xs text-gray-400">{field.hint}</p>
                    )}
                    {errors[field.id as keyof typeof errors] && (
                        <p className="text-xs font-medium text-red-500">
                            {errors[field.id as keyof typeof errors]?.message as string}
                        </p>
                    )}
                </div>
            ))}

            {/* Threshold */}
            <div className="space-y-1.5">
                <Label htmlFor="lowStockThreshold" className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Ambang Batas Stok Menipis
                </Label>
                <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="lowStockThreshold"
                        type="number"
                        className="pl-10 h-11 rounded-xl bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
                        {...register('lowStockThreshold', { valueAsNumber: true })}
                    />
                </div>
                <p className="text-xs text-gray-400">
                    Produk dengan stok di bawah nilai ini akan memicu peringatan.
                </p>
                {errors.lowStockThreshold && (
                    <p className="text-xs font-medium text-red-500">{errors.lowStockThreshold.message}</p>
                )}
            </div>

            {/* Divider */}
            <div className="pt-4 border-t border-gray-100">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 h-11 px-8 gap-1.5">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Simpan Pengaturan
                </Button>
            </div>
        </form>
    )
}
