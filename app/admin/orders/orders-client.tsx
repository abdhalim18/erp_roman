'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, ShoppingCart, Filter, Eye, MoreHorizontal, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatusDialog } from './order-status-dialog'
import { Order } from '@/app/actions/orders'

interface OrdersClientProps {
    initialOrders: Order[]
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
    const [orders, setOrders] = useState(initialOrders)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const filteredOrders = orders.filter((order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order as any).customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Statistics
    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const completedOrders = orders.filter((o) => o.status === 'completed').length
    const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    const statusCounts = {
        pending: pendingOrders,
        processing: orders.filter((o) => o.status === 'processing').length,
        completed: completedOrders,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }

    const recentOrders = filteredOrders.slice(0, 5)

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
            month: 'short',
            day: 'numeric',
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

    const handleEditStatus = (order: Order) => {
        setSelectedOrder(order)
        setStatusDialogOpen(true)
    }

    const handleStatusUpdateSuccess = () => {
        // In a real app with server actions revalidating path, this might auto-update via router refresh
        // For now we can just reload or let revalidatePath handle it if this is a server component wrapper
        // Since we are in client component and want immediate feedback without full reload if possible,
        // we rely on revalidatePath in the server action to update the data on next fetch/refresh.
        // However, to see it immediately in local state:
        if (selectedOrder) {
            // This is a bit tricky since we don't know the new status here easily 
            // unless we pass it back or re-fetch.
            // Simplest is to reload window for now to get fresh data from server
            window.location.reload()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-2">Manage customer orders and transactions</p>
                </div>
                <Button asChild>
                    <Link href="/admin/orders/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Completed Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{completedOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">From all orders</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Order List</CardTitle>
                            <CardDescription>View and manage all orders</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Items</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <ShoppingCart className="h-12 w-12 mb-4 text-gray-400" />
                                                <p className="text-lg font-medium">No orders found</p>
                                                <p className="text-sm mt-1">Try a different search or create a new order</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {order.order_number}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {(order as any).customers?.name || 'Guest'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {(order as any).order_items?.length || 0} items
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusColor(order.status) as any}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/orders/${order.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditStatus(order)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Status
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest order activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No recent orders to display
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                                            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
                                            <p className="text-xs text-gray-500">{(order as any).customers?.name || 'Guest'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                        <CardDescription>Overview of order statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Pending</span>
                                <span className="text-sm font-medium">{statusCounts.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Processing</span>
                                <span className="text-sm font-medium">{statusCounts.processing}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Completed</span>
                                <span className="text-sm font-medium">{statusCounts.completed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cancelled</span>
                                <span className="text-sm font-medium">{statusCounts.cancelled}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedOrder && (
                <OrderStatusDialog
                    open={statusDialogOpen}
                    onOpenChange={setStatusDialogOpen}
                    orderId={selectedOrder.id}
                    currentStatus={selectedOrder.status}
                    onSuccess={handleStatusUpdateSuccess}
                />
            )}
        </div>
    )
}
