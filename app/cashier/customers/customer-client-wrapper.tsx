'use client'

import { useState } from 'react'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CustomerClientWrapper() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
            </Button>
            <CustomerDialog
                open={open}
                onOpenChange={setOpen}
                mode="create"
            />
        </>
    )
}
