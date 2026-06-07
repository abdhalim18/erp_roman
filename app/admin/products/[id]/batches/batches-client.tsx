'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Package, Pen, Trash2, AlertTriangle } from 'lucide-react'
import { addProductBatch, editProductBatch, deleteProductBatch, type ProductBatch } from '@/app/actions/batches'
import { formatRupiah, parseRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BatchesClient({ product, initialBatches, suppliers }: { product: any, initialBatches: ProductBatch[], suppliers: any[] }) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<ProductBatch | null>(null)

  
  const [quantity, setQuantity] = useState('1')
  const [cost, setCost] = useState(product.cost ? product.cost.toString() : '0')
  const [expiryDate, setExpiryDate] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [supplierId, setSupplierId] = useState('')

  const handleOpenDialog = (batch?: ProductBatch) => {
    if (batch) {
      setEditingBatch(batch)
      setQuantity(batch.quantity.toString())
      setCost(batch.cost ? batch.cost.toString() : '0')
      setExpiryDate(batch.expiry_date ? batch.expiry_date.split('T')[0] : '')
      setPurchaseDate(batch.purchase_date ? batch.purchase_date.split('T')[0] : '')
      setSupplierId(batch.supplier_id || '')
    } else {
      setEditingBatch(null)
      setQuantity('1')
      setCost(product.cost ? product.cost.toString() : '0')
      setExpiryDate('')
      setPurchaseDate('')
      setSupplierId('')
    }
    setIsDialogOpen(true)
  }

  const promptDeleteBatch = (batch: ProductBatch) => {
    setBatchToDelete(batch)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!batchToDelete?.id) return
    
    setLoading(true)
    try {
      const result = await deleteProductBatch(batchToDelete.id, product.id)
      if (result.success) {
        toast.success('Batch berhasil dihapus')
        router.refresh()
      } else {
        toast.error(result.error || 'Gagal menghapus batch')
      }
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setBatchToDelete(null)
    }
  }

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const qtyValue = parseInt(quantity)
    if (qtyValue > 9999) {
      toast.error('Jumlah stok (kuantitas) maksimal adalah 9.999.')
      setLoading(false)
      return
    }

    const costValue = cost ? parseRupiah(cost) : 0
    if (costValue > 99999999) {
      toast.error('Harga modal maksimal adalah Rp 99.999.999.')
      setLoading(false)
      return
    }

    if (expiryDate) {
      const expiry = new Date(expiryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (expiry < today) {
        toast.error('Obat yang sudah kedaluwarsa tidak dapat ditambahkan ke gudang. Periksa kembali tanggal kedaluwarsa.')
        setLoading(false)
        return
      }

      const maxExpiry = new Date(today)
      maxExpiry.setFullYear(maxExpiry.getFullYear() + 10)
      if (expiry > maxExpiry) {
        toast.error('Tanggal kedaluwarsa maksimal adalah 10 tahun dari sekarang.')
        setLoading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append('product_id', product.id)
    formData.append('quantity', quantity)
    if (cost) formData.append('cost', costValue.toString())
    if (expiryDate) formData.append('expiry_date', expiryDate)
    if (purchaseDate) formData.append('purchase_date', purchaseDate)
    if (supplierId) formData.append('supplier_id', supplierId)

    if (editingBatch) formData.append('batch_id', editingBatch.id)

    try {
      const result = editingBatch 
        ? await editProductBatch(formData) 
        : await addProductBatch(formData)

      if (result.success) {
        toast.success(`Batch stok berhasil ${editingBatch ? 'diperbarui' : 'ditambahkan'}`)
        setIsDialogOpen(false)
        router.refresh()
        
        // Reset form
        setEditingBatch(null)
        setQuantity('1')
        setExpiryDate('')
      } else {
        toast.error(result.error || `Gagal ${editingBatch ? 'memperbarui' : 'menambahkan'} stok`)
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan stok')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Stok & Batch</h1>
            <p className="text-gray-600 mt-2">
              {product.name} ({product.kode_produk}) - Kategori: {product.categories?.name || '-'}
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Barang Masuk (Batch)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stok Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{product.stock} {product.unit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Batch Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{initialBatches.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Batch / Stok Masuk</CardTitle>
          <CardDescription>Riwayat barang masuk yang belum terjual habis, dinilai berdasarkan FEFO.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tgl. Masuk Dibuat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tgl. Beli</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tgl. Kedaluwarsa</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Harga Modal / Unit</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Sisa Kuantitas</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialBatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Package className="h-12 w-12 mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Tidak ada stok aktif</p>
                        <p className="text-sm mt-1">Produk ini kehabisan stok atau belum ada barang masuk.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  initialBatches.map((batch) => (
                    <tr key={batch.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(batch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {batch.purchase_date ? new Date(batch.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {batch.suppliers?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {batch.expiry_date ? (
                          <span className={new Date(batch.expiry_date) < new Date() ? 'text-red-600' : 'text-gray-900'}>
                            {new Date(batch.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {new Date(batch.expiry_date) < new Date() && ' (Basi)'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {batch.cost ? formatRupiah(batch.cost) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                        {batch.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenDialog(batch)}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => promptDeleteBatch(batch)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
          <form onSubmit={handleSaveBatch}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">{editingBatch ? 'Edit' : 'Tambah'} Barang Masuk</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {editingBatch 
                  ? `Ubah informasi stok atau tanggal kedaluwarsa untuk batch produk ${product.name}.`
                  : `Masukkan jumlah stok baru dan tanggal kadaluwarsanya. Ini akan membuat rekaman Batch baru untuk produk ${product.name}.`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Jumlah Masuk *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="9999"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Harga Modal (Total per {product.unit})</Label>
                <Input
                  id="cost"
                  type="text"
                  value={formatRupiah(parseFloat(cost) || 0)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setCost(value)
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setCost(value || '0')
                  }}
                  disabled={loading}
                  placeholder="Rp 0"
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Tanggal Beli</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  disabled={loading}
                  className="bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_id" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Supplier</Label>
                <select
                  id="supplier_id"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl px-3 transition-all outline-none"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Tanggal Kadaluwarsa *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-white border-gray-200 text-gray-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2 border-t border-gray-100 pt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading} className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-11">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 h-11 px-8">
                {loading ? 'Menyimpan...' : 'Simpan Batch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4 scale-110">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center text-gray-900">
              Hapus Barang Masuk
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-500 pt-2">
              Apakah Anda yakin ingin menghapus stok masuk ini {batchToDelete?.expiry_date ? `(Exp: ${new Date(batchToDelete.expiry_date).toLocaleDateString('id-ID')})` : ''}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 sm:space-x-0 mt-6 border-t border-gray-50 pt-5">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 h-11" disabled={loading}>
                Batalkan
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-500/20 flex-1 h-11 border-0"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
