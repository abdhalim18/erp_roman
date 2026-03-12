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
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

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
        onOpenChange(false)
        e.currentTarget.reset()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch {
      setError('Terjadi kesalahan yang tidak terduga')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi detail untuk menambahkan produk baru ke inventaris Anda'
              : 'Perbarui informasi produk'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description || ''}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_id" className="text-right">
                Kategori
              </Label>
              {isLoadingCategories ? (
                <div className="col-span-3 flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="col-span-3">
                  <Select
                    name="category_id"
                    defaultValue={product?.category_id || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Satuan
              </Label>
              <div className="col-span-3">
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit || 'unit'}
                  disabled={loading}
                  placeholder="misalnya: unit, kg, liter"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga *</Label>
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
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Modal</Label>
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
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product?.stock || 0}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Stok Min</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                min="0"
                defaultValue={product?.min_stock || 10}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={product?.status || 'active'} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                  <SelectItem value="discontinued">Dihentikan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Tanggal Kedaluwarsa</Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={product?.expiry_date ? new Date(product.expiry_date).toISOString().split('T')[0] : ''}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Tambah Produk' : 'Perbarui Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
