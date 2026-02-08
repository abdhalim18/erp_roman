
import { getOrderById } from '@/app/actions/orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Printer, Download, User, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { order, error } = await getOrderById(params.id)

    if (error || !order) {
        if (!order) notFound()
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    Error loading order: {error}
                </div>
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success'
            case 'processing': return 'info'
            case 'pending': return 'warning'
            case 'cancelled': return 'destructive'
            default: return 'secondary'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'success'
            case 'partial': return 'warning'
            case 'unpaid': return 'destructive'
            case 'refunded': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order {order.order_number}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Placed on {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>
                                List of products in this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.order_items?.map((item: any) => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500">{item.products?.sku || 'No SKU'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">Subtotal</td>
                                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total_amount - (order.tax || 0) + (order.discount || 0))}
                                            </td>
                                        </tr>
                                        {(order.discount > 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-red-600">Discount</td>
                                                <td className="px-4 py-2 text-right text-sm font-medium text-red-600">
                                                    - {formatCurrency(order.discount)}
                                                </td>
                                            </tr>
                                        )}
                                        {(order.tax > 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">Tax</td>
                                                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(order.tax)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="border-t border-gray-200">
                                            <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-gray-900">Total</td>
                                            <td className="px-4 py-3 text-right text-base font-bold text-blue-600">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                <p className="text-sm font-medium capitalize">{order.payment_method || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                <Badge variant={getPaymentStatusColor(order.payment_status) as any}>
                                    {order.payment_status.toUpperCase()}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Current Status</p>
                                    <Badge className="w-full justify-center py-1.5" variant={getStatusColor(order.status) as any}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </div>
                                {order.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                                            {order.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.customers ? (
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customers.name}</p>
                                            <p className="text-xs text-gray-500">Customer</p>
                                        </div>
                                    </div>
                                    {order.customers.email && (
                                        <div className="flex items-start space-x-3">
                                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600 break-all">{order.customers.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customers.phone && (
                                        <div className="flex items-start space-x-3">
                                            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">{order.customers.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customers.address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">{order.customers.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic">
                                    Guest Customer (No details available)
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
