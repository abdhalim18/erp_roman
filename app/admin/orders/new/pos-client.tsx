'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { type Product } from '@/app/actions/products'
import { createOrderWithItems } from '@/app/actions/orders'
import { Loader2, Plus, Minus, Trash2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

type POSNewOrderProps = {
  products: Product[]
  customers: { id: string; name: string; email: string | null }[]
}

type CartItem = {
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  discount: number
  maxStock: number
}

export default function POSNewOrder({ products, customers }: POSNewOrderProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [notes, setNotes] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, startTransition] = useTransition()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // When closing the create customer dialog, refresh the page to fetch the new customer list
  useEffect(() => {
    if (!createOpen) {
      router.refresh()
    }
  }, [createOpen, router])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [search, products])

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product_id === p.id)
      if (found) {
        if (found.quantity + 1 > found.maxStock) return prev
        return prev.map((i) => (i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      if (p.stock <= 0) return prev
      return [
        ...prev,
        {
          product_id: p.id,
          product_name: p.name,
          unit_price: p.price,
          quantity: 1,
          discount: 0,
          maxStock: p.stock,
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
    setCart((prev) => prev.map((i) => (i.product_id === product_id ? { ...i, discount: Math.max(0, discount) } : i)))
  }

  const removeItem = (product_id: string) => setCart((prev) => prev.filter((i) => i.product_id !== product_id))

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), [cart])
  const totalDiscount = useMemo(() => cart.reduce((sum, i) => sum + i.discount, 0), [cart])
  const total = useMemo(() => Math.max(0, subtotal - totalDiscount), [subtotal, totalDiscount])

  const canCheckout = cart.length > 0 && !!customerId && cart.every((i) => i.quantity <= i.maxStock)

  const handleCheckout = () => {
    setError('')
    setSuccess('')
    if (!canCheckout) return

    startTransition(async () => {
      const payload = {
        customer_id: customerId,
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
        setError(res.error || 'Failed to create order')
        return
      }
      setSuccess(`Order ${res.order_number} created`)
      setCart([])
      setNotes('')
      setCustomerId('')
      setPaymentMethod('cash')
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Products</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="border rounded-md p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                    <div className="text-xs text-gray-500">Stock: {p.stock}</div>
                  </div>
                  <div className="text-sm font-semibold">${p.price.toFixed(2)}</div>
                </div>
                <Button className="mt-3 w-full" size="sm" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-sm text-gray-500">No items in cart</div>
          ) : (
            <div className="space-y-3">
              {cart.map((i) => {
                const lineSubtotal = i.unit_price * i.quantity
                const lineTotal = Math.max(0, lineSubtotal - i.discount)
                return (
                  <div key={i.product_id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{i.product_name}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(i.product_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div>
                        <Label className="text-xs">Qty (max {i.maxStock})</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQty(i.product_id, i.quantity - 1)}
                            disabled={i.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            inputMode="numeric"
                            value={i.quantity}
                            onChange={(e) => updateQty(i.product_id, Number(e.target.value) || 1)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQty(i.product_id, i.quantity + 1)}
                            disabled={i.quantity >= i.maxStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Discount</Label>
                        <Input
                          inputMode="decimal"
                          value={i.discount}
                          onChange={(e) => updateDiscount(i.product_id, Number(e.target.value) || 0)}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Subtotal: ${lineSubtotal.toFixed(2)}</div>
                        <div className="text-sm font-semibold">Line total: ${lineTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-${totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="space-y-2">
              <Label>Customer</Label>
              <div className="flex gap-2">
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.email ? `(${c.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
            {success && <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">{success}</div>}

            <Button className="w-full" onClick={handleCheckout} disabled={!canCheckout || submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Checkout
            </Button>
          </div>
        </CardContent>
      </Card>

      <CustomerDialog open={createOpen} onOpenChange={setCreateOpen} mode="create" />
    </div>
  )
}
