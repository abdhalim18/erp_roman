'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, XCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeName: string
  orderNumber: string
  date: string
  items: ReceiptItem[]
  totalAmount: number
  paymentMethod: string
  cashReceived?: number
  cashChange?: number
  cashierName?: string
}

export function ReceiptModal({
  open,
  onOpenChange,
  storeName,
  orderNumber,
  date,
  items,
  totalAmount,
  paymentMethod,
  cashReceived,
  cashChange,
  cashierName = 'Kasir'
}: ReceiptModalProps) {

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-center text-lg text-emerald-800">Transaksi Berhasil</DialogTitle>
        </DialogHeader>

        {/* Receipt Container - ini yang akan diprint */}
        <div id="receipt-content" className="bg-white p-4 font-mono text-sm text-gray-800 flex flex-col print:absolute print:inset-0 print:m-0 print:p-0 print:border-none print:-translate-y-[60px]">
          <div className="text-center mb-4">
            <h2 className="font-bold text-xl uppercase tracking-widest">{storeName}</h2>
            <p className="text-xs text-gray-500 mt-1">Struk Pembelian</p>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span>No: {orderNumber}</span>
            <span>Kasir: {cashierName}</span>
          </div>
          <div className="text-xs mb-4 border-b border-dashed border-gray-300 pb-2">
            Waktu: {new Date(date).toLocaleString('id-ID')}
          </div>

          {/* Items */}
          <div className="space-y-3 border-b border-dashed border-gray-300 pb-4 mb-2">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col">
                <span className="font-semibold text-xs truncate max-w-full">{item.name}</span>
                <div className="flex justify-between items-center text-xs mt-0.5">
                  <span className="text-gray-600">{item.quantity} x {formatRupiah(item.price)}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>TOTAL</span>
            <span>{formatRupiah(totalAmount)}</span>
          </div>

          <div className="flex justify-between text-xs mb-1">
            <span>Metode Pembayaran</span>
            <span className="uppercase">{paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'qris' ? 'QRIS' : 'Transfer'}</span>
          </div>

          {paymentMethod === 'cash' && cashReceived !== undefined && (
            <>
              <div className="flex justify-between text-xs mb-1">
                <span>Tunai</span>
                <span>{formatRupiah(cashReceived)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium mt-1">
                <span>Kembalian</span>
                <span>{formatRupiah(cashChange || 0)}</span>
              </div>
            </>
          )}

          <div className="text-center text-xs mt-6 pt-4 border-t border-dashed border-gray-300 text-gray-500">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="mt-1">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
          </div>
        </div>

        <DialogFooter className="print:hidden sm:justify-center flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            <XCircle className="w-4 h-4 mr-2" />
            Tutup
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="w-4 h-4 mr-2" />
            Cetak Struk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
