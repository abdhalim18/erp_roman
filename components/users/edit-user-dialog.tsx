'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Edit, KeyRound, UserCog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUser } from '@/app/actions/users'

const editUserSchema = z.object({
    role: z.enum(['admin', 'cashier']),
    password: z.string().optional().refine(
        (val) => !val || val.length >= 6,
        { message: 'Kata sandi minimal 6 karakter' }
    ),
    confirmPassword: z.string().optional(),
}).refine(
    (data) => !data.password || data.password === data.confirmPassword,
    { message: 'Konfirmasi kata sandi tidak cocok', path: ['confirmPassword'] }
)

type EditUserFormValues = z.infer<typeof editUserSchema>

interface EditUserDialogProps {
    userId: string
    userEmail: string
    currentRole: 'admin' | 'cashier'
}

export function EditUserDialog({ userId, userEmail, currentRole }: EditUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            role: currentRole,
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(data: EditUserFormValues) {
        setLoading(true)
        try {
            const result = await updateUser(userId, {
                role: data.role,
                password: data.password || undefined,
            })

            if (result.success) {
                toast.success('Pengguna berhasil diperbarui')
                setOpen(false)
                form.reset()
            } else {
                toast.error('Gagal memperbarui pengguna: ' + result.error)
            }
        } catch {
            toast.error('Terjadi kesalahan yang tidak terduga')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setOpen(true)}
                title="Edit Pengguna"
            >
                <Edit className="h-3.5 w-3.5" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                                <UserCog className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">Edit Pengguna</DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                                    {userEmail}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
                        {/* Role */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <UserCog className="h-3.5 w-3.5 text-gray-400" />
                                Peran (Role)
                            </Label>
                            <Select
                                value={form.watch('role')}
                                onValueChange={(value) => form.setValue('role', value as 'admin' | 'cashier')}
                            >
                                <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-blue-500 h-11 rounded-xl w-full">
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                                    <SelectItem value="cashier" className="rounded-lg focus:bg-blue-50 focus:text-blue-900 cursor-pointer">Kasir</SelectItem>
                                    <SelectItem value="admin" className="rounded-lg focus:bg-blue-50 focus:text-blue-900 cursor-pointer">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.role && (
                                <p className="text-xs font-medium text-red-500">{form.formState.errors.role.message}</p>
                            )}
                        </div>

                        {/* Password (opsional) */}
                        <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-gray-400" />
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Reset Kata Sandi (Opsional)</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-password" className="text-xs text-gray-600">Kata Sandi Baru</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                        {...form.register('password')}
                                        className="bg-white border-gray-200 h-10 rounded-xl text-sm"
                                    />
                                    {form.formState.errors.password && (
                                        <p className="text-xs font-medium text-red-500">{form.formState.errors.password.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-confirm-password" className="text-xs text-gray-600">Konfirmasi Kata Sandi</Label>
                                    <Input
                                        id="edit-confirm-password"
                                        type="password"
                                        placeholder="Ulangi kata sandi baru"
                                        {...form.register('confirmPassword')}
                                        className="bg-white border-gray-200 h-10 rounded-xl text-sm"
                                    />
                                    {form.formState.errors.confirmPassword && (
                                        <p className="text-xs font-medium text-red-500">{form.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setOpen(false); form.reset() }}
                                className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
