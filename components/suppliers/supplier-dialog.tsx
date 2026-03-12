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

  const handleDelete = async () => {
    if (!supplier) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplier.id)

      if (error) throw error

      toast.success('Supplier deleted successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{supplier ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}</DialogTitle>
            <DialogDescription>
              {supplier ? 'Perbarui detail pemasok di bawah ini.' : 'Isi detail untuk menambahkan pemasok baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  placeholder="Nama pemasok"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Kontak Person</Label>
                <Input
                  id="contact_person"
                  placeholder="Nama kontak person"
                  {...register('contact_person')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  placeholder="Nomor telepon"
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                placeholder="Alamat jalan"
                {...register('address')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  placeholder="Kota"
                  {...register('city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Provinsi</Label>
                <Input
                  id="state"
                  placeholder="Provinsi"
                  {...register('state')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Kode Pos</Label>
                <Input
                  id="zip_code"
                  placeholder="Kode Pos"
                  {...register('zip_code')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">NPWP</Label>
              <Input
                id="tax_number"
                placeholder="Nomor NPWP/Pajak"
                {...register('tax_number')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan"
                {...register('notes')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('status')}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            {supplier && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="mr-auto"
              >
                Hapus
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
