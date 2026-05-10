'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from '@/app/actions/users'

const userSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    role: z.enum(['admin', 'cashier']),
})

type UserFormValues = z.infer<typeof userSchema>

export function UserDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: '',
            password: '',
            role: 'cashier',
        },
    })

    async function onSubmit(data: UserFormValues) {
        setLoading(true)
        try {
            const result = await createUser(data.email, data.password, data.role)
            if (result.success) {
                toast.success('Pengguna berhasil dibuat')
                setOpen(false)
                form.reset()
            } else {
                toast.error('Gagal membuat pengguna: ' + result.error)
            }
        } catch (err) {
            toast.error('Terjadi kesalahan yang tidak terduga')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pengguna
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Tambah Pengguna Baru</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Buat akses masuk baru untuk Admin atau Kasir baru Anda.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Email *</Label>
                        <Input id="email" type="email" placeholder="contoh: kasir@tokoroman.com" {...form.register('email')} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all" />
                        {form.formState.errors.email && (
                            <p className="text-sm font-medium text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kata Sandi *</Label>
                        <Input id="password" type="password" placeholder="Min. 6 karakter" {...form.register('password')} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all" />
                        {form.formState.errors.password && (
                            <p className="text-sm font-medium text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Peran (Role) *</Label>
                        <Select
                            onValueChange={(value) => form.setValue('role', value as 'admin' | 'cashier')}
                            defaultValue={form.getValues('role')}
                        >
                            <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-emerald-500 h-11 rounded-xl w-full">
                                <SelectValue placeholder="Pilih Peran" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                                <SelectItem value="cashier" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Kasir</SelectItem>
                                <SelectItem value="admin" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.role && (
                            <p className="text-sm font-medium text-red-500">{form.formState.errors.role.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Pengguna'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
