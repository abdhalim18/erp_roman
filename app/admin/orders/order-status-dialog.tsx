'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { updateOrderStatus } from '@/app/actions/orders'
import { Loader2 } from 'lucide-react'

interface OrderStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
    currentStatus: string
    onSuccess?: () => void
}

export function OrderStatusDialog({
    open,
    onOpenChange,
    orderId,
    currentStatus,
    onSuccess,
}: OrderStatusDialogProps) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await updateOrderStatus(orderId, status)
            if (result.success) {
                onOpenChange(false)
                if (onSuccess) onSuccess()
            } else {
                alert('Failed to update status: ' + result.error)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('An error occurred while updating status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>
                        Change the status of this order. This may trigger notifications to the customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
