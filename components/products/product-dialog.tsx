'use client'

import { useEffect, useState } from 'react'
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
import { createProduct, updateProduct, type Product, getCategoriesForSelect } from '@/app/actions/products'
import { Loader2 } from 'lucide-react'
import { formatRupiah, parseRupiah } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  mode: 'create' | 'edit'
}

export function ProductDialog({ open, onOpenChange, product, mode }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')

  // Load categories and set initial values on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const { categories, error } = await getCategoriesForSelect()
      if (!error) {
        setCategories(categories || [])
      }
      setIsLoadingCategories(false)
    }

    // Set initial price and cost values
    if (product) {
      setPrice(product.price ? product.price.toString() : '0')
      setCost(product.cost ? product.cost.toString() : '0')
    } else {
      setPrice('0')
      setCost('0')
    }

    loadCategories()
  }, [product])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError('')

    const formData = new FormData(form)

    // Convert formatted values back to numbers
    const priceValue = parseRupiah(price)
    const costValue = cost ? parseRupiah(cost) : 0

    formData.set('price', priceValue.toString())
    if (cost) formData.set('cost', costValue.toString())

    try {
      const result = mode === 'create'
        ? await createProduct(formData)
        : await updateProduct(product!.id, formData)

      if (result.success) {
        toast.success(mode === 'create' ? 'Produk berhasil ditambahkan' : 'Produk berhasil diperbarui')
        onOpenChange(false)
        form.reset()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err?.message || String(err) || 'Terjadi kesalahan yang tidak terduga')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {mode === 'create'
              ? 'Isi rincian produk baru untuk menambahkannya ke sistem inventaris Anda.'
              : 'Perbarui rincian dan harga produk.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Nama Produk *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Vitamin Sapi"
                defaultValue={product?.name}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Deskripsi Tambahan</Label>
              <Input
                id="description"
                name="description"
                placeholder="Rincian deskripsi singkat"
                defaultValue={product?.description || ''}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="category_id" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kategori</Label>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center h-11 bg-gray-50 rounded-xl border border-gray-100">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                </div>
              ) : (
                <Select name="category_id" defaultValue={product?.category_id || undefined}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-emerald-500 h-11 rounded-xl w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                    <SelectItem value="none" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Tidak ada (Umum)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kode_produk" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kode Produk *</Label>
              <Input
                id="kode_produk"
                name="kode_produk"
                placeholder="SKU-XXX"
                defaultValue={product?.kode_produk}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Satuan</Label>
              <Input
                id="unit"
                name="unit"
                defaultValue={product?.unit || 'unit'}
                disabled={loading}
                placeholder="misalnya: dus, kg, pcs"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Harga Jual *</Label>
              <Input
                id="price"
                name="price"
                type="text"
                value={formatRupiah(parseFloat(price) || 0)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setPrice(value)
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setPrice(value || '0')
                }}
                required
                disabled={loading}
                placeholder="Rp 0"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Harga Modal (Beli)</Label>
              <Input
                id="cost"
                name="cost"
                type="text"
                value={cost ? formatRupiah(parseFloat(cost) || 0) : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setCost(value)
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setCost(value || '')
                }}
                disabled={loading}
                placeholder="Rp 0"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className={`grid ${mode === 'create' ? 'grid-cols-4' : 'grid-cols-2'} gap-5`}>
            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Stok Awal *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={0}
                  required
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="min_stock" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Stok Minimal Alert</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min="0"
                defaultValue={product?.min_stock || 10}
                disabled={loading}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Status *</Label>
              <Select name="status" defaultValue={product?.status || 'active'} disabled={loading}>
                <SelectTrigger className="bg-white border-gray-200 text-gray-900 focus:ring-emerald-500 h-11 rounded-xl w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                  <SelectItem value="active" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Aktif Dijual</SelectItem>
                  <SelectItem value="inactive" className="rounded-lg focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">Disembunyikan</SelectItem>
                  <SelectItem value="discontinued" className="rounded-lg focus:bg-red-50 focus:text-red-900 cursor-pointer">Dihentikan (Expired)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="expiry_date" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Tgl Kadaluwarsa</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-gray-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 h-11 px-8 items-center flex">
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {mode === 'create' ? 'Tambah Produk' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
