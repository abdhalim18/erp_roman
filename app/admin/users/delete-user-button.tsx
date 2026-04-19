'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteUser } from '@/app/actions/users'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteUserButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        setLoading(true)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                toast.success('User deleted successfully')
            } else {
                toast.error('Failed to delete user: ' + result.error)
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl max-w-md">
                <AlertDialogHeader>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4 scale-110">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-center text-gray-900">
                        Hapus Pengguna
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-sm text-gray-500 pt-2">
                        Apakah Anda yakin ingin menghapus akun pengguna ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center gap-2 sm:space-x-0 mt-6 border-t border-gray-50 pt-5">
                    <AlertDialogCancel asChild>
                        <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 h-11" disabled={loading}>
                            Batalkan
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-500/20 flex-1 h-11 border-0"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
