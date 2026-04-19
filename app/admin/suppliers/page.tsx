'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SupplierDialog } from '@/components/suppliers/supplier-dialog'
import { Search, Plus, Truck, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
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

type Supplier = {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      let query = supabase.from('suppliers').select('*').order('name', { ascending: true })
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`)
      const { data, error } = await query
      if (error) throw error
      setSuppliers((data || []).map((s: any) => ({
        ...s,
        contact_person: s.contact_person || '',
        email: s.email || '',
        phone: s.phone || '',
      })))
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [searchTerm])

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setSelectedSupplier(null)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    fetchSuppliers()
    setIsDialogOpen(false)
  }

  const promptDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierToDelete.id)

      if (error) {
        if (error.code === '23503') {
          toast.error('Gagal: Pemasok sedang digunakan dalam histori data stok/produk.', { duration: 5000 })
        } else {
          throw error
        }
        return
      }

      toast.success('Pemasok berhasil dihapus')
      fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Gagal menghapus pemasok')
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  const activeCount = suppliers.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pemasok</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola pemasok dan informasi kontak mereka</p>
        </div>
        <Button size="sm" className="self-start sm:self-auto gap-1.5" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
          Tambah Pemasok
        </Button>
      </div>

      {/* Stat mini cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pemasok</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{suppliers.length}</p>
              <p className="text-xs text-gray-400 mt-1">Terdaftar di sistem</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-violet-50 opacity-60" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pemasok Aktif</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
              <p className="text-xs text-gray-400 mt-1">Siap beroperasi</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Daftar Pemasok</p>
            <p className="text-xs text-gray-400">{suppliers.length} pemasok terdaftar</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari pemasok..."
              className="pl-9 h-8 w-60 text-sm border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kontak Person</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Telepon</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mb-3" />
                      <p className="text-sm">Memuat pemasok...</p>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Truck className="h-10 w-10 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        {searchTerm ? 'Pemasok tidak ditemukan' : 'Belum ada pemasok'}
                      </p>
                      <p className="text-xs mt-1">
                        {searchTerm ? 'Coba kata kunci lain' : 'Mulai tambahkan pemasok pertama Anda'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{supplier.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{supplier.contact_person || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{supplier.email || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{supplier.phone || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        supplier.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {supplier.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(supplier)}
                          title="Edit Pemasok"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => promptDeleteSupplier(supplier)}
                          title="Hapus Pemasok"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplier={selectedSupplier}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4 scale-110">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center text-gray-900">
              Hapus Pemasok
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-500 pt-2">
              Apakah Anda yakin ingin menghapus <strong className="text-gray-900">{supplierToDelete?.name}</strong> dari daftar pemasok? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 sm:space-x-0 mt-6 border-t border-gray-50 pt-5">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 h-11">
                Batalkan
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleDeleteSupplier}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-500/20 flex-1 h-11 border-0"
              >
                Ya, Hapus
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
