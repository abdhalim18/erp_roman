'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Package, Tag } from 'lucide-react'
import { getProducts, type Product } from '@/app/actions/products'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function ProductCheckPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [stockFilter, setStockFilter] = useState('all')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 20

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedCategory, stockFilter])

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true)
            const { products } = await getProducts()
            setProducts(products || [])
            setLoading(false)
        }
        loadProducts()
    }, [])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.kode_produk?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory
        
        let matchesStock = true
        if (stockFilter === 'available') {
            matchesStock = p.stock > (p.min_stock || 0)
        } else if (stockFilter === 'low') {
            matchesStock = p.stock > 0 && p.stock <= (p.min_stock || 0)
        } else if (stockFilter === 'empty') {
            matchesStock = p.stock === 0
        }

        return matchesSearch && matchesCategory && matchesStock
    })

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const categories = Array.from(new Set(products.map(p => p.category_name).filter(Boolean))) as string[]

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cek Stok Barang</h1>
                <p className="text-sm text-gray-500 mt-0.5">Cari barang untuk melihat harga dan sisa stok.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        className="pl-10 h-9 border-gray-200 text-sm"
                        placeholder="Cari nama barang atau kode produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 border-gray-200 text-sm">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-48">
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="h-9 border-gray-200 text-sm">
                            <SelectValue placeholder="Semua Stok" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Stok</SelectItem>
                            <SelectItem value="available">Stok Aman</SelectItem>
                            <SelectItem value="low">Stok Menipis</SelectItem>
                            <SelectItem value="empty">Stok Habis (0)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Card */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {filteredProducts.length} barang ditemukan
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Harga</th>
                                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Stok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mb-3" />
                                            <p className="text-sm">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Package className="h-10 w-10 mb-3 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-500">Tidak ada barang ditemukan</p>
                                            <p className="text-xs mt-1">Coba kata kunci lain</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {product.kode_produk || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{product.category_name || '—'}</td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                product.stock <= 0
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : product.stock <= 5
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 print:hidden">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> hingga{' '}
                            <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> dari{' '}
                            <span className="font-medium text-gray-900">{filteredProducts.length}</span> barang
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
