'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
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
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
