import { getActiveShifts, getShiftHistory, getShiftSales } from '@/app/actions/shifts'
import { ShiftClient } from './shift-client'
import { getUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function ShiftReportPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const { shifts: activeShifts } = await getActiveShifts()
  const { shifts: historyShifts } = await getShiftHistory(10)

  // Fetch sales for active shifts if any
  // Format is { [shiftId]: { cash: number, nonCash: number } }
  const salesMap: Record<string, { cash: number; nonCash: number }> = {}

  for (const shift of activeShifts) {
    const sales = await getShiftSales(shift.opened_at)
    salesMap[shift.id] = sales
  }

  return (
    <ShiftClient 
      initialActiveShifts={activeShifts} 
      historyShifts={historyShifts} 
      salesMap={salesMap} 
    />
  )
}
