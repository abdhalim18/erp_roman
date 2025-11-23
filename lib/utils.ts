import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number | string): string {
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  
  // Format number with dot as thousand separator
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(Math.round(numAmount));
  
  return `Rp ${formattedAmount}`;
}

export function parseRupiah(rupiah: string): number {
  // Remove all non-digit characters and parse to number
  const numericString = rupiah.replace(/[^\d]/g, '');
  return numericString ? parseInt(numericString, 10) : 0;
}
