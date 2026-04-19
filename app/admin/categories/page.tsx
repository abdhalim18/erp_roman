'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Plus, Search, Trash2, Tag, AlertTriangle } from 'lucide-react'
import { getCategories, deleteCategory, createCategory, updateCategory } from '@/app/actions/categories'
import type { Category } from '@/app/actions/categories'
import { toast } from 'sonner'
import { CategoryDialog } from '@/components/categories/category-dialog'
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const { categories, error } = await getCategories()
      if (error) throw new Error(error)
      setCategories(categories)
      setFilteredCategories(categories)
    } catch (error) {
      toast.error('Gagal memuat kategori')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const promptDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete?.id) return
    try {
      setIsDeleting(categoryToDelete.id)
      const { success, error } = await deleteCategory(categoryToDelete.id)
      if (error) throw new Error(error)
      if (success) { toast.success('Kategori dihapus'); fetchCategories() }
    } catch {
      toast.error('Gagal menghapus kategori')
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleSave = async (categoryData: Partial<Category> & { name: string }) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', categoryData.name)
      if (categoryData.description) formData.append('description', categoryData.description)
      const result = categoryData.id
        ? await updateCategory(categoryData.id, formData)
        : await createCategory(formData)
      if (result.error) throw new Error(result.error)
      if (result.success) {
        toast.success(categoryData.id ? 'Kategori diperbarui' : 'Kategori ditambahkan')
        fetchCategories()
        setIsDialogOpen(false)
        setCurrentCategory(null)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan kategori')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola kategori produk toko Anda</p>
        </div>
        <Button
          size="sm"
          className="self-start sm:self-auto gap-1.5"
          onClick={() => { setCurrentCategory(null); setIsDialogOpen(true) }}
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Daftar Kategori</p>
            <p className="text-xs text-gray-400">{filteredCategories.length} kategori ditemukan</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari kategori..."
              className="pl-9 h-8 w-60 text-sm border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Dibuat</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
                      <p className="text-sm">Memuat kategori...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Tag className="h-10 w-10 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        {searchTerm ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
                      </p>
                      <p className="text-xs mt-1">
                        {searchTerm ? 'Coba kata kunci lain' : 'Mulai tambahkan kategori pertama'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{category.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{category.description || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {new Date(category.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => { setCurrentCategory(category); setIsDialogOpen(true) }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => promptDeleteCategory(category)}
                          disabled={isDeleting === category.id}
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

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={currentCategory}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4 scale-110">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center text-gray-900">
              Hapus Kategori
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-gray-500 pt-2">
              Apakah Anda yakin ingin menghapus kategori <strong className="text-gray-900">{categoryToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 sm:space-x-0 mt-6 border-t border-gray-50 pt-5">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 h-11" disabled={!!isDeleting}>
                Batalkan
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleDeleteConfirm}
                disabled={!!isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-500/20 flex-1 h-11 border-0"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
