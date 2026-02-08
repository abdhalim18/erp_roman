'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings, type AppSettings } from '@/app/actions/settings'

const settingsSchema = z.object({
    storeName: z.string().min(2, {
        message: 'Store name must be at least 2 characters.',
    }),
    storeAddress: z.string().optional(),
    storePhone: z.string().optional(),
    lowStockThreshold: z.coerce.number().min(1, {
        message: 'Threshold must be at least 1.',
    }),
    alertEmail: z.string().email().optional().or(z.literal('')),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    initialSettings: AppSettings
}

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
                toast.success('Settings updated successfully')
            } else {
                toast.error('Failed to update settings: ' + result.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" placeholder="Toko Roman" {...register('storeName')} />
                <p className="text-sm text-muted-foreground">This is the name that will be displayed on your store.</p>
                {errors.storeName && (
                    <p className="text-sm font-medium text-destructive">{errors.storeName.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input id="storeAddress" placeholder="Jl. Raya..." {...register('storeAddress')} />
                {errors.storeAddress && (
                    <p className="text-sm font-medium text-destructive">{errors.storeAddress.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="storePhone">Store Phone / WA</Label>
                <Input id="storePhone" placeholder="08..." {...register('storePhone')} />
                {errors.storePhone && (
                    <p className="text-sm font-medium text-destructive">{errors.storePhone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input id="lowStockThreshold" type="number" {...register('lowStockThreshold')} />
                <p className="text-sm text-muted-foreground">Products with stock at or below this value will trigger an alert.</p>
                {errors.lowStockThreshold && (
                    <p className="text-sm font-medium text-destructive">{errors.lowStockThreshold.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="alertEmail">Alert Email Recipient</Label>
                <Input id="alertEmail" placeholder="admin@example.com" {...register('alertEmail')} />
                <p className="text-sm text-muted-foreground">Email address to receive low stock notifications.</p>
                {errors.alertEmail && (
                    <p className="text-sm font-medium text-destructive">{errors.alertEmail.message}</p>
                )}
            </div>

            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update settings
            </Button>
        </form>
    )
}
