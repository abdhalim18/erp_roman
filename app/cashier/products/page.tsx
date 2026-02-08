'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
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
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Cek Stok Barang</h2>
                <p className="text-gray-500">Cari barang untuk melihat harga dan sisa stok.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="Cari nama barang atau SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nama Barang</th>
                            <th className="px-4 py-3 font-medium">SKU</th>
                            <th className="px-4 py-3 font-medium">Kategori</th>
                            <th className="px-4 py-3 font-medium text-right">Harga</th>
                            <th className="px-4 py-3 font-medium text-center">Stok</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    Tidak ada barang ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{product.sku || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{product.category?.name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 0 ? 'bg-red-100 text-red-700' :
                                            product.stock <= 5 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
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
    )
}
