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
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUser } from '@/app/actions/users'

const userSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
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
        },
    })

    async function onSubmit(data: UserFormValues) {
        setLoading(true)
        try {
            const result = await createUser(data.email, data.password)
            if (result.success) {
                toast.success('User created successfully')
                setOpen(false)
                form.reset()
            } else {
                toast.error('Failed to create user: ' + result.error)
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="cashier@example.com" {...form.register('email')} />
                        {form.formState.errors.email && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...form.register('password')} />
                        {form.formState.errors.password && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
