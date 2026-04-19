'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

// Kita bisa meminta initial threshold dari server sebagai props, 
// tapi untuk simple realtime alert, kita bisa hardcode fallback 8 jika tidak di-pass
export function RealtimeStockAlert({ threshold = 8 }: { threshold?: number }) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // Listen ke tabel products untuk UPDATE action
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          const product = payload.new
          
          // Jika stok berubah dan turun ke bawah threshold
          if (product && product.stock !== undefined && product.stock <= threshold) {
            // Bisa diperbaiki untuk membedakan perubahan stok
            const oldProduct = payload.old
            if (oldProduct && oldProduct.stock > product.stock) {
              // Notifikasi pakai Sonner toast
              toast.error(`Stok Menipis: ${product.name}`, {
                description: `Sisa stok: ${product.stock} pcs. Segera lakukan restock.`,
                icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                duration: 6000,
                position: 'top-right'
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, threshold])

  return null // Headless component (hanya listeners)
}
