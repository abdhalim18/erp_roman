'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Category = {
  id?: string
  name: string
  description: string | null
}

type CategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSave: (category: Category) => void
  isSaving: boolean
}

export function CategoryDialog({ open, onOpenChange, category, onSave, isSaving }: CategoryDialogProps) {
  const [formData, setFormData] = useState<Category>({ name: '', description: '' })

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name || '',
        description: category.description || ''
      })
    } else {
      setFormData({ name: '', description: '' })
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">{category?.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {category?.id ? 'Perbarui detail kategori Anda.' : 'Tambah kategori baru untuk mengorganisir produk Anda.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 text-xs uppercase tracking-wider font-bold">
                Nama Kategori *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 rounded-xl transition-all"
                required
                placeholder="Contoh: ATK, Elektronik..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 text-xs uppercase tracking-wider font-bold">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl transition-all"
                rows={3}
                placeholder="Tuliskan keterangan singkat terkait kategori ini..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20">
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
