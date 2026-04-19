'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, PlayCircle, StopCircle, Banknote, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { type Shift, openShift, closeShift } from '@/app/actions/shifts'
import { formatRupiah } from '@/lib/utils'

interface ShiftClientProps {
  initialActiveShifts: Shift[]
  historyShifts: Shift[]
  salesMap: Record<string, { cash: number; nonCash: number }>
}

export function ShiftClient({ initialActiveShifts, historyShifts, salesMap }: ShiftClientProps) {
  const [modalAwal, setModalAwal] = useState('')
  const [setoranAkhir, setSetoranAkhir] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  
  const [isPending, startTransition] = useTransition()

  // Untuk form buka shift
  const handleOpenShift = () => {
    if (!modalAwal) return toast.error('Isi nominal modal awal')
    const balance = parseInt(modalAwal)
    if (isNaN(balance) || balance < 0) return toast.error('Nominal tidak valid')

    startTransition(async () => {
      const res = await openShift(balance)
      if (res.success) {
        toast.success('Shift berhasil dibuka')
        setModalAwal('')
      } else {
        toast.error(res.error || 'Gagal membuka shift')
      }
    })
  }

  // Untuk tutup shift spesifik
  const handleCloseShift = (shiftId: string) => {
    const closingStr = setoranAkhir[shiftId]
    if (!closingStr) return toast.error('Isi nominal setoran akhir kas')
    
    const balance = parseInt(closingStr)
    if (isNaN(balance) || balance < 0) return toast.error('Nominal tidak valid')

    startTransition(async () => {
      const res = await closeShift(shiftId, balance, notes[shiftId])
      if (res.success) {
        toast.success('Shift berhasil ditutup')
      } else {
        toast.error(res.error || 'Gagal menutup shift')
      }
    })
  }

  // Total summary calculation if there is at least one active shift
  const currentSales = initialActiveShifts.reduce((acc, shift) => {
    const s = salesMap[shift.id] || { cash: 0, nonCash: 0 }
    acc.cash += s.cash
    acc.nonCash += s.nonCash
    return acc
  }, { cash: 0, nonCash: 0 })

  return (
    <div className="space-y-5 max-w-4xl mx-auto md:mx-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Laporan Shift</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola modal awal dan setoran akhir shift.</p>
      </div>

      {/* Summary mini cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Penjualan Tunai</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatRupiah(currentSales.cash)}</p>
              <p className="text-xs text-gray-400 mt-1">Selama shift aktif saat ini</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Banknote className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Penjualan Non-Tunai</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatRupiah(currentSales.nonCash)}</p>
              <p className="text-xs text-gray-400 mt-1">Kartu & transfer</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-blue-50 opacity-60" />
        </div>
      </div>

      {/* Cards - Buka Shift Area */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
            <PlayCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Buka Shift Baru</p>
            <p className="text-xs text-gray-400">Modal awal kas laci</p>
          </div>
        </div>
        <div className="px-5 py-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-1.5 flex-1 w-full">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Nominal Modal Awal
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 h-10 border-gray-200"
                placeholder="0"
                value={modalAwal}
                onChange={(e) => setModalAwal(e.target.value)}
                type="number"
                disabled={isPending}
              />
            </div>
          </div>
          <Button onClick={handleOpenShift} disabled={isPending} className="w-full md:w-auto h-10 gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Buka Shift
          </Button>
        </div>
      </div>

      {/* Active Shifts List */}
      {initialActiveShifts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-800 mt-6">Shift Aktif Anda</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {initialActiveShifts.map((shift) => (
              <div key={shift.id} className="rounded-xl border border-red-100 bg-white shadow-sm overflow-hidden border-t-2 border-t-red-500">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-red-50/30">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-sm">
                    <StopCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tutup Shift</p>
                    <p className="text-xs text-gray-500">Dibuka: {new Date(shift.opened_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Modal Awal</span>
                      <span className="font-semibold text-gray-700">{formatRupiah(shift.opening_balance)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500">Total Penjualan Tunai</span>
                      <span className="font-bold text-emerald-600">{formatRupiah(salesMap[shift.id]?.cash || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500">Total Seharusnya d Laci</span>
                      <span className="font-bold text-gray-900">{formatRupiah(shift.opening_balance + (salesMap[shift.id]?.cash || 0))}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Total Setoran Kasir (Uang Fisik)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10 h-9 border-gray-200 text-sm"
                        placeholder="0"
                        value={setoranAkhir[shift.id] || ''}
                        onChange={(e) => setSetoranAkhir({ ...setoranAkhir, [shift.id]: e.target.value })}
                        type="number"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">
                      Catatan Perbedaan Kas (Opsional)
                    </Label>
                    <Input
                      className="h-9 border-gray-200 text-sm"
                      placeholder="Contoh: uang receh kurang 2000"
                      value={notes[shift.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [shift.id]: e.target.value })}
                      disabled={isPending}
                    />
                  </div>

                  <Button 
                    onClick={() => handleCloseShift(shift.id)} 
                    disabled={isPending}
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-1.5 border-red-200 text-red-600 hover:bg-red-50 mt-2"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
                    Simpan Laporan Akhir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {historyShifts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold tracking-tight text-gray-800 mb-4">Riwayat Shift Anda</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Waktu Dibuka</th>
                  <th className="px-4 py-3 font-semibold">Waktu Ditutup</th>
                  <th className="px-4 py-3 font-semibold text-right">Modal Awal</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Tunai</th>
                  <th className="px-4 py-3 font-semibold text-right">Setoran Kasir</th>
                  <th className="px-4 py-3 font-semibold text-right">Selisih</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyShifts.map(s => {
                  const selisih = (s.closing_balance || 0) - (s.opening_balance + s.total_cash_sales)
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(s.opened_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.closed_at ? new Date(s.closed_at).toLocaleString('id-ID') : '-'}</td>
                      <td className="px-4 py-3 text-gray-900 text-right font-medium">{formatRupiah(s.opening_balance)}</td>
                      <td className="px-4 py-3 text-emerald-600 text-right font-bold">{formatRupiah(s.total_cash_sales)}</td>
                      <td className="px-4 py-3 text-gray-900 text-right font-medium">{s.closing_balance !== null ? formatRupiah(s.closing_balance) : '-'}</td>
                      <td className={`px-4 py-3 text-right font-bold ${selisih < 0 ? 'text-red-500' : selisih > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                        {s.closing_balance !== null ? (selisih > 0 ? '+' : '') + formatRupiah(selisih) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase ${s.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
