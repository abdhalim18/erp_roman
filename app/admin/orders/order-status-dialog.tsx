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
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Ubah Status Pesanan</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Perbarui status pesanan ini. Hal ini dapat memicu notifikasi jika diaktifkan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-gray-700 text-xs uppercase tracking-wider font-bold">
                            Pilih Status Baru
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-emerald-500 h-11 rounded-xl w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                                <SelectItem value="pending" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Pending / Menunggu</SelectItem>
                                <SelectItem value="processing" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Diproses</SelectItem>
                                <SelectItem value="completed" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Selesai</SelectItem>
                                <SelectItem value="cancelled" className="rounded-lg focus:bg-red-50 focus:text-red-900 cursor-pointer">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-gray-100 pt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
                        Batal
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
