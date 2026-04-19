'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Package, Tag } from 'lucide-react'
import { getProducts, type Product } from '@/app/actions/products'

export default function ProductCheckPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true)
            const { products } = await getProducts()
            setProducts(products || [])
            setLoading(false)
        }
        loadProducts()
    }, [])

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kode_produk?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cek Stok Barang</h1>
                <p className="text-sm text-gray-500 mt-0.5">Cari barang untuk melihat harga dan sisa stok.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    className="pl-10 h-9 border-gray-200 text-sm"
                    placeholder="Cari nama barang atau kode produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                                filteredProducts.map((product) => (
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
            </div>
        </div>
    )
}
