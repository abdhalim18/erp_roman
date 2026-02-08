'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export default function ShiftReportPage() {
    const [modalAwal, setModalAwal] = useState('')
    const [setoranAkhir, setSetoranAkhir] = useState('')

    const handleSaveModal = () => {
        toast.success('Modal awal tersimpan (Simulasi)')
    }

    const handleClosing = () => {
        toast.success('Laporan shift tersimpan (Simulasi)')
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Laporan Shift</h2>
                <p className="text-gray-500">Kelola modal awal dan setoran akhir shift.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Buka Shift (Modal Awal)</CardTitle>
                        <CardDescription>Masukkan jumlah uang kas saat memulai shift.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nominal Modal</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="0"
                                    value={modalAwal}
                                    onChange={(e) => setModalAwal(e.target.value)}
                                    type="number"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveModal} className="w-full">
                            Simpan Modal Awal
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tutup Shift (Setoran)</CardTitle>
                        <CardDescription>Masukkan total uang tunai saat mengakhiri shift.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Penjualan Tunai (Estimasi)</span>
                                <span className="font-medium">Rp 0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Penjualan Non-Tunai</span>
                                <span className="font-medium">Rp 0</span>
                            </div>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                            <Label>Total Setoran Tunai</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="0"
                                    value={setoranAkhir}
                                    onChange={(e) => setSetoranAkhir(e.target.value)}
                                    type="number"
                                />
                            </div>
                        </div>
                        <Button onClick={handleClosing} variant="secondary" className="w-full">
                            Simpan Laporan Akhir
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
