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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCustomer, updateCustomer, type Customer } from '@/app/actions/customers'
import { Loader2 } from 'lucide-react'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  mode: 'create' | 'edit'
}

export function CustomerDialog({ open, onOpenChange, customer, mode }: CustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const result = mode === 'create'
        ? await createCustomer(formData)
        : await updateCustomer(customer!.id, formData)

      if (result.success) {
        onOpenChange(false)
        form.reset()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Tambah Pelanggan Baru' : 'Edit Pelanggan'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {mode === 'create'
              ? 'Isi detail untuk menambahkan pelanggan baru ke sistem.'
              : 'Perbarui informasi pelanggan Anda.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Nama Pelanggan *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={customer?.name}
              placeholder="Contoh: Budi Santoso"
              required
              disabled={loading}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                defaultValue={customer?.email || ''}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Telepon</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Contoh: 0812345678"
                defaultValue={customer?.phone || ''}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Alamat Lengkap</Label>
            <Input
              id="address"
              name="address"
              placeholder="Alamat tempat tinggal atau kantor"
              defaultValue={customer?.address || ''}
              disabled={loading}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kota</Label>
              <Input
                id="city"
                name="city"
                placeholder="Kota"
                defaultValue={customer?.city || ''}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Provinsi</Label>
              <Input
                id="state"
                name="state"
                placeholder="Provinsi"
                defaultValue={customer?.state || ''}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kode Pos</Label>
              <Input
                id="zip_code"
                name="zip_code"
                placeholder="Kode Pos"
                defaultValue={customer?.zip_code || ''}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Catatan</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Catatan profil pelanggan..."
              defaultValue={customer?.notes || ''}
              disabled={loading}
              rows={3}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl transition-all pt-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Status *</Label>
            <Select name="status" defaultValue={customer?.status || 'active'} disabled={loading}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-emerald-500 h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                <SelectItem value="active" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Aktif</SelectItem>
                <SelectItem value="inactive" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Tambah Pelanggan' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
