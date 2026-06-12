'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { type Product } from '@/app/actions/products'
import { createOrderWithItems } from '@/app/actions/orders'
import { Loader2, Plus, Minus, Trash2, Search, ShoppingCart, Package, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'
import { formatRupiah, cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { ReceiptModal } from '@/components/cashier/receipt-modal'
import { type PaymentMethod } from '@/app/actions/payment_methods'

type POSNewOrderProps = {
  products: Product[]
  customers: { id: string; name: string; email: string | null }[]
  lowStockThreshold?: number
  paymentMethods: PaymentMethod[]
  storeName?: string
  storeAddress?: string
  storePhone?: string
  cashierName?: string
}

type CartItem = {
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  discount: number
  maxStock: number
  earliest_expiry_date?: string | null
}

export default function POSNewOrder({ products, customers, lowStockThreshold = 8, paymentMethods, storeName = 'Toko Roman', storeAddress, storePhone, cashierName = 'Kasir' }: POSNewOrderProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods.find(m => m.is_cash)?.id || paymentMethods[0]?.id || '')
  const [notes, setNotes] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, startTransition] = useTransition()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  
  // Custom Customer Dropdown States
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [customerSearchText, setCustomerSearchText] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!customerSearchText.trim()) return customers
    const lower = customerSearchText.toLowerCase()
    return customers.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      (c.email && c.email.toLowerCase().includes(lower))
    )
  }, [customers, customerSearchText])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownOpen) {
        const target = e.target as HTMLElement
        if (!target.closest('.customer-dropdown-container')) {
          setCustomerDropdownOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [customerDropdownOpen])

  useEffect(() => {
    if (!createOpen) router.refresh()
  }, [createOpen, router])

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category_name).filter(Boolean))) as string[]
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let filteredProducts = products

    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category_name === selectedCategory)
    }

    if (!q) return filteredProducts
    return filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.kode_produk.toLowerCase().includes(q)
    )
  }, [search, selectedCategory, products])

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product_id === p.id)
      if (found) {
        if (found.quantity + 1 > found.maxStock) return prev
        return prev.map((i) => (i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      const availableStock = p.sellable_stock !== undefined ? p.sellable_stock : p.stock
      if (availableStock <= 0) return prev
      return [
        ...prev,
        {
          product_id: p.id,
          product_name: p.name,
          unit_price: p.price,
          quantity: 1,
          discount: 0,
          maxStock: availableStock,
          earliest_expiry_date: p.earliest_expiry_date,
        },
      ]
    })
  }

  const updateQty = (product_id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === product_id
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
          : i
      )
    )
  }

  const updateDiscount = (product_id: string, discount: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product_id === product_id ? { ...i, discount: Math.max(0, discount) } : i))
    )
  }

  const removeItem = (product_id: string) =>
    setCart((prev) => prev.filter((i) => i.product_id !== product_id))

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), [cart])
  const totalDiscount = useMemo(() => cart.reduce((sum, i) => sum + i.discount, 0), [cart])
  const total = useMemo(() => Math.max(0, subtotal - totalDiscount), [subtotal, totalDiscount])

  const selectedMethod = useMemo(() => paymentMethods.find(m => m.id === paymentMethod), [paymentMethods, paymentMethod])
  const isCashMethod = selectedMethod?.is_cash ?? false

  const canCheckout = cart.length > 0
    && cart.every((i) => i.quantity <= i.maxStock)
    && (!isCashMethod || cashReceived >= total)

  const handleCheckout = () => {
    setError('')
    setSuccess('')
    if (!canCheckout) return

    startTransition(async () => {
      const payload = {
        customer_id: customerId === 'guest' || customerId === '' ? undefined : customerId,
        payment_method: paymentMethod,
        notes,
        items: cart.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
        })),
      }

      const res = await createOrderWithItems(payload)
      if (!res.success) {
        setError(res.error || 'Gagal membuat pesanan')
        return
      }
      setReceiptData({
        orderNumber: res.order_number,
        date: new Date().toISOString(),
        items: cart.map(i => ({
          name: i.product_name,
          quantity: i.quantity,
          price: i.unit_price,
        subtotal: Math.max(0, (i.unit_price * i.quantity) - i.discount)
      })),
      totalAmount: total,
      paymentMethod: selectedMethod?.name || paymentMethod,
      cashReceived: isCashMethod ? cashReceived : undefined,
      cashChange: isCashMethod ? Math.max(0, cashReceived - total) : undefined,
      customerName: customers.find(c => c.id === customerId)?.name || (!customerId || customerId === 'guest' ? 'Tamu' : undefined)
    })

      setSuccess(`Pesanan ${res.order_number} berhasil dibuat!`)
      setReceiptOpen(true)
      
      // Reset form
      setCart([])
      setNotes('')
      setCustomerId('')
      setPaymentMethod(paymentMethods.find(m => m.is_cash)?.id || paymentMethods[0]?.id || '')
      setCashReceived(0)
    })
  }

  const handleCloseReceipt = (open: boolean) => {
    setReceiptOpen(open)
    if (!open) {
      setReceiptData(null)
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {/* Product Grid */}
      <div className="md:col-span-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Pilih Produk</p>
            <p className="text-xs text-gray-400">{filtered.length} produk tersedia</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                className="pl-9 h-8 text-sm border-gray-200"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
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
          </div>
        </div>

        {/* Product Cards */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {filtered.map((p) => {
                const isExpired = p.earliest_expiry_date && new Date(p.earliest_expiry_date) < new Date()
                const isAlert = p.earliest_expiry_date && !isExpired &&
                  new Date(p.earliest_expiry_date) < new Date(new Date().setDate(new Date().getDate() + 30))
                
                const availableStock = p.sellable_stock !== undefined ? p.sellable_stock : p.stock
                const isOutOfStock = availableStock <= 0
                const inCart = cart.find(i => i.product_id === p.id)

                return (
                  <div
                    key={p.id}
                    className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-150 ${
                      isOutOfStock
                        ? 'border-gray-100 bg-gray-50 opacity-60'
                        : inCart
                          ? 'border-emerald-200 bg-emerald-50/50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                        {inCart.quantity}
                      </span>
                    )}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{p.kode_produk}</p>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : availableStock <= lowStockThreshold
                              ? 'bg-orange-50 text-orange-600 border border-orange-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          Stok: {availableStock} {p.stock > availableStock ? `(Total: ${p.stock})` : ''}
                        </span>
                        {p.earliest_expiry_date && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            isExpired
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : isAlert
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}>
                            Exp: {new Date(p.earliest_expiry_date).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-emerald-600">{formatRupiah(p.price)}</p>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs gap-1"
                        onClick={() => addToCart(p)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock && p.stock > 0 ? 'Kedaluwarsa' : isOutOfStock ? 'Habis' : <><Plus className="h-3 w-3" /> Tambah</>}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-800">Keranjang</p>
          </div>
          {cart.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              {cart.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[320px] px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <ShoppingCart className="h-8 w-8 mb-2 text-gray-200" />
              <p className="text-xs text-gray-400">Keranjang masih kosong</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map((item) => {
                const lineSubtotal = item.unit_price * item.quantity
                const lineTotal = Math.max(0, lineSubtotal - item.discount)
                return (
                  <div key={item.product_id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.product_name}</p>
                        {item.earliest_expiry_date && (
                          <p className="text-[10px] text-amber-500">
                            Exp: {new Date(item.earliest_expiry_date).toLocaleDateString('id-ID')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Jumlah (maks {item.maxStock})</Label>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQty(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e) => updateQty(item.product_id, Number(e.target.value) || 1)}
                            className="h-6 text-center text-xs px-0 border-gray-200 w-10"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQty(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Diskon</Label>
                        <Input
                          inputMode="decimal"
                          value={item.discount}
                          onChange={(e) => updateDiscount(item.product_id, Number(e.target.value) || 0)}
                          className="h-6 text-xs border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">{formatRupiah(item.unit_price)} × {item.quantity}</span>
                      <span className="text-xs font-bold text-emerald-600">{formatRupiah(lineTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Summary + Checkout */}
        <div className="border-t border-gray-100 px-4 py-4 space-y-3">
          {cart.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-red-500">
                  <span>Diskon</span>
                  <span>-{formatRupiah(totalDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-emerald-600">{formatRupiah(total)}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* Customer */}
            <div>
              <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pelanggan</Label>
              <div className="flex gap-1.5">
                <div className="relative flex-1 customer-dropdown-container">
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  >
                    <span className="truncate">
                      {customerId === 'guest' || !customerId
                        ? 'Tamu'
                        : customers.find(c => c.id === customerId)?.name || 'Tamu'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </button>
                  
                  {customerDropdownOpen && (
                    <div className="absolute bottom-full mb-1 z-50 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-md flex flex-col">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <Input
                            autoFocus
                            placeholder="Cari pelanggan..."
                            className="h-7 pl-7 text-[11px] border-gray-200 focus-visible:ring-emerald-500"
                            value={customerSearchText}
                            onChange={(e) => setCustomerSearchText(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto p-1 max-h-48 flex-1">
                        <div 
                          className={cn("flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-gray-100", (customerId === 'guest' || !customerId) ? "bg-gray-50 font-medium" : "")}
                          onClick={() => {
                            setCustomerId('guest')
                            setCustomerDropdownOpen(false)
                            setCustomerSearchText('')
                          }}
                        >
                          Tamu
                        </div>
                        {filteredCustomers.map(c => (
                          <div 
                            key={c.id}
                            className={cn("flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-gray-100", customerId === c.id ? "bg-gray-50 font-medium" : "")}
                            onClick={() => {
                              setCustomerId(c.id)
                              setCustomerDropdownOpen(false)
                              setCustomerSearchText('')
                            }}
                          >
                            <span className="truncate">{c.name} {c.email ? <span className="text-gray-400 text-[10px]">({c.email})</span> : ''}</span>
                          </div>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <div className="px-2 py-3 text-center text-[10px] text-gray-500">
                            Pelanggan tidak ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-gray-200"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Payment */}
            <div>
              <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Metode Bayar</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.length === 0 && (
                    <SelectItem value="none" disabled>Belum ada metode</SelectItem>
                  )}
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.is_cash ? '💵' : '💳'} {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cash Received (Kembalian) - Hanya tampil jika metode mendukung tunai */}
            {isCashMethod && (
              <div className="space-y-2 pt-1 border-t border-gray-100 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Uang Diterima</Label>
                    <Input
                      type="number"
                      min={0}
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 text-xs border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Kembalian</Label>
                    <div className={`h-8 rounded-md flex items-center px-3 text-xs font-bold border ${cashReceived >= total ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {cashReceived >= total ? formatRupiah(cashReceived - total) : '-'}
                    </div>
                  </div>
                </div>
                
                {/* Shortcut Uang Pas & Nominal */}
                <div className="flex flex-wrap gap-1.5">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-6 px-2.5 text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                    onClick={() => setCashReceived(total)}
                  >
                    Uang Pas
                  </Button>
                  {[100000, 50000, 20000, 10000].map(amount => (
                    <Button 
                      key={amount}
                      type="button" 
                      variant="outline" 
                      className="h-6 px-2 text-[10px] border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={() => setCashReceived(amount)}
                    >
                      {formatRupiah(amount).replace('Rp', '').replace(',00', '').trim()}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Catatan</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan opsional..."
                className="h-8 text-xs border-gray-200"
              />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button
            className="w-full gap-1.5"
            size="sm"
            onClick={handleCheckout}
            disabled={!canCheckout || submitting}
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <ShoppingCart className="h-3.5 w-3.5" />
            Checkout {cart.length > 0 && `(${cart.length} item)`}
          </Button>
        </div>
      </div>

      <CustomerDialog open={createOpen} onOpenChange={setCreateOpen} mode="create" />
      
      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          open={receiptOpen}
          onOpenChange={handleCloseReceipt}
          storeName={storeName}
          storeAddress={storeAddress}
          storePhone={storePhone}
          cashierName={cashierName}
          orderNumber={receiptData.orderNumber}
          date={receiptData.date}
          items={receiptData.items}
          totalAmount={receiptData.totalAmount}
          paymentMethod={receiptData.paymentMethod}
          cashReceived={receiptData.cashReceived}
          cashChange={receiptData.cashChange}
          customerName={receiptData.customerName}
        />
      )}
    </div>
  )
}
