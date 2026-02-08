'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCustomer, updateCustomer, type Customer } from '@/app/actions/customers'
import { Loader2 } from 'lucide-react'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  mode: 'create' | 'edit'
}

export function CustomerDialog({ open, onOpenChange, customer, mode }: CustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const result = mode === 'create'
        ? await createCustomer(formData)
        : await updateCustomer(customer!.id, formData)

      if (result.success) {
        onOpenChange(false)
        form.reset()
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Customer' : 'Edit Customer'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the details to add a new customer'
              : 'Update the customer information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={customer?.name}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email || ''}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer?.phone || ''}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={customer?.address || ''}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={customer?.city || ''}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                defaultValue={customer?.state || ''}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                defaultValue={customer?.zip_code || ''}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={customer?.notes || ''}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" defaultValue={customer?.status || 'active'} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Add Customer' : 'Update Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
