'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  tax_number: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface Supplier extends SupplierFormValues {
  id: string;
  created_at?: string;
  updated_at?: string;
}

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zip_code: supplier.zip_code || '',
        tax_number: supplier.tax_number || '',
        notes: supplier.notes || '',
        status: supplier.status || 'active',
      })
    } else {
      reset({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        tax_number: '',
        notes: '',
        status: 'active',
      })
    }
  }, [supplier, reset])

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      setLoading(true)

      if (supplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supplier.id)

        if (error) throw error

        toast.success('Supplier updated successfully')
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert([data])
          .select()

        if (error) throw error

        toast.success('Supplier created successfully')
      }

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">{supplier ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {supplier ? 'Perbarui detail pemasok di bawah ini.' : 'Isi detail untuk menambahkan pemasok baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Nama Pemasok *</Label>
                <Input
                  id="name"
                  placeholder="Contoh: PT Sumber Makmur"
                  {...register('name')}
                  className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kontak Person</Label>
                <Input
                  id="contact_person"
                  placeholder="Nama narahubung"
                  {...register('contact_person')}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  {...register('email')}
                  className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Telepon</Label>
                <Input
                  id="phone"
                  placeholder="Contoh: 08123456789"
                  {...register('phone')}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Alamat Lengkap</Label>
              <Input
                id="address"
                placeholder="Alamat jalan atau gedung"
                {...register('address')}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kota</Label>
                <Input
                  id="city"
                  placeholder="Kota"
                  {...register('city')}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Provinsi</Label>
                <Input
                  id="state"
                  placeholder="Provinsi"
                  {...register('state')}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kode Pos</Label>
                <Input
                  id="zip_code"
                  placeholder="Kode Pos"
                  {...register('zip_code')}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number" className="text-gray-700 text-xs uppercase tracking-wider font-bold">NPWP</Label>
              <Input
                id="tax_number"
                placeholder="Nomor NPWP / Pajak perusahaan"
                {...register('tax_number')}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Keterangan tambahan atau rincian spesifik tentang pemasok..."
                {...register('notes')}
                rows={3}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl transition-all pt-3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Status Pemasok</Label>
              <select
                id="status"
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                {...register('status')}
              >
                <option value="active">Aktif beroperasi</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
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
              {loading ? 'Menyimpan...' : 'Simpan Pemasok'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
