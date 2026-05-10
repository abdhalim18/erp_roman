
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Download, FileText, Printer, BarChart3, TrendingUp, Package, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductTransactionRow } from '@/app/actions/reports'
import { PaymentMethod } from '@/app/actions/payment_methods'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { getSalesReportPerProduct } from '@/app/actions/reports'

interface ReportsClientProps {
  initialReports: ProductTransactionRow[]
  paymentMethods: PaymentMethod[]
}

export function ReportsClient({ initialReports, paymentMethods }: ReportsClientProps) {
  const [period, setPeriod] = useState<string>('all')
  const [paymentMethod, setPaymentMethod] = useState<string>('all')
  const [reportsData, setReportsData] = useState<ProductTransactionRow[]>(initialReports)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    async function fetchFilteredData() {
      setIsLoading(true)
      let startDate
      let groupBy: 'transaction' | 'month' = 'transaction'
      const now = new Date()

      if (period === 'today') {
        now.setHours(0, 0, 0, 0)
        startDate = now.toISOString()
      } else if (period === 'week') {
        now.setDate(now.getDate() - 7)
        startDate = now.toISOString()
      } else if (period === 'month') {
        now.setDate(now.getDate() - 30)
        startDate = now.toISOString()
      } else if (period === 'year') {
        now.setFullYear(now.getFullYear() - 1)
        startDate = now.toISOString()
        groupBy = 'month'
      }

      const { data, error } = await getSalesReportPerProduct({ startDate, groupBy, paymentMethod })
      if (!error) {
        setReportsData(data)
      }
      setIsLoading(false)
      setCurrentPage(1)
    }

    fetchFilteredData()
  }, [period, paymentMethod])

  const filteredReports = reportsData.filter(r =>
    r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalProductsSold = reportsData.reduce((sum, r) => sum + r.quantity, 0)
  const totalRevenue = reportsData.reduce((sum, r) => sum + r.revenue, 0)
  const totalCostPrice = reportsData.reduce((sum, r) => sum + r.cost_total, 0)
  const totalTransactions = reportsData.length
  const totalMargin = totalRevenue - totalCostPrice
  const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  const isYear = period === 'year'

  const handleExportExcel = () => {
    const exportData = filteredReports.map(r => {
      const data: any = {
        [isYear ? 'Bulan' : 'Waktu']: r.date
      }
      if (!isYear) {
        data['Nama Produk'] = r.product_name
        data['Metode Pembayaran'] = r.payment_method || '-'
        data['Item Terjual'] = r.quantity
        data['Modal (Harga Beli)'] = r.cost_total
      }
      data['Total Pendapatan'] = r.revenue
      if (!isYear) {
        data['Margin'] = r.revenue - r.cost_total
      }
      return data
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan")
    XLSX.writeFile(wb, `Laporan_Penjualan.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Laporan Penjualan Toko Roman", 14, 15)
    doc.setFontSize(10)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22)

    const tableColumn = isYear 
      ? ["Bulan", "Pendapatan"] 
      : ["Waktu", "Nama Produk", "Metode Pembayaran", "Item Terjual", "Modal", "Pendapatan", "Margin"]
    
    const tableRows = filteredReports.map((r) => isYear ? [
      r.date,
      formatCurrency(r.revenue)
    ] : [
      r.date,
      r.product_name,
      r.payment_method || '-',
      `${r.quantity} item`,
      formatCurrency(r.cost_total),
      formatCurrency(r.revenue),
      formatCurrency(r.revenue - r.cost_total)
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    })

    doc.save(`Laporan_Penjualan.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight print:hidden">Penjualan per Produk</h1>
          <h1 className="text-2xl font-bold text-black hidden print:block text-center">Laporan Penjualan per Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5 print:text-center">
            Analisis penjualan harian per produk berdasarkan transaksi terbaru
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50">
                <Download className="h-4 w-4" />
                Export Laporan
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Pilih Format</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                <Printer className="h-4 w-4 mr-2 text-emerald-600" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-rose-600" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Item Terjual</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{totalProductsSold}</p>
              <p className="text-xs text-gray-400 mt-1">Item barang keluar</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-blue-50 opacity-60" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Modal</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(totalCostPrice)}</p>
              <p className="text-xs text-gray-400 mt-1">Total harga beli barang</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-orange-50 opacity-60" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pendapatan</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">Dari order tervalidasi (Selesai)</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full bg-emerald-50 opacity-60" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Margin Keuntungan</p>
              <p className={`mt-2 text-xl font-bold ${totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(totalMargin)}</p>
              <p className="text-xs text-gray-400 mt-1">{marginPercentage.toFixed(1)}% dari pendapatan</p>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${totalMargin >= 0 ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-rose-600'}`}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className={`absolute bottom-0 right-0 h-14 w-14 translate-x-3 translate-y-3 rounded-full ${totalMargin >= 0 ? 'bg-emerald-50' : 'bg-red-50'} opacity-60`} />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 print:hidden">
          <div>
            <p className="text-sm font-semibold text-gray-800">Daftar Penjualan {period === 'year' ? 'Bulanan' : 'Harian'} per Produk</p>
            <p className="text-xs text-gray-400">Menampilkan rekapan item produk terjual {period === 'year' ? 'per bulan' : 'berdasarkan waktu transaksi'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                <SelectItem value="year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Metode Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                {paymentMethods.map(pm => (
                  <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari produk atau waktu..."
                className="pl-9 h-9 w-full sm:w-64 text-sm border-gray-200 focus:border-indigo-300 bg-gray-50 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-indigo-50/60 border-b-2 border-indigo-100">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'4%'}}>No</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'14%'}}>{isYear ? 'Bulan' : 'Waktu'}</th>
                {!isYear && <th className="px-4 py-3.5 text-left text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'22%'}}>Nama Produk</th>}
                {!isYear && <th className="px-4 py-3.5 text-center text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'12%'}}>Pembayaran</th>}
                {!isYear && <th className="px-4 py-3.5 text-center text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'10%'}}>Item Terjual</th>}
                {!isYear && <th className="px-4 py-3.5 text-right text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'14%'}}>Modal</th>}
                <th className="px-4 py-3.5 text-right text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'14%'}}>Pendapatan</th>
                {!isYear && <th className="px-4 py-3.5 text-right text-[11px] font-bold text-indigo-600 uppercase tracking-wider" style={{width:'10%'}}>Margin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={isYear ? 3 : 9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin mb-3 text-indigo-400" />
                      <p className="text-sm font-medium">Memuat data periode...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={isYear ? 3 : 9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Calendar className="h-10 w-10 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">Tidak ada penjualan ditemukan</p>
                      <p className="text-xs mt-1">Belum ada data transaksi yang berstatus Selesai untuk periode ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report, idx) => {
                  const trueRank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1
                  const isEven = idx % 2 === 0
                  return (
                    <tr key={report.date + idx} className={`hover:bg-indigo-50/30 transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-3 text-xs text-gray-400 font-medium">{trueRank}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">{report.date}</td>
                      {!isYear && <td className="px-4 py-3 text-sm font-semibold text-gray-900 truncate">{report.product_name}</td>}
                      {!isYear && (
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {paymentMethods.find(m => m.id === report.payment_method)?.name || report.payment_method || '-'}
                          </span>
                        </td>
                      )}
                      {!isYear && (
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-indigo-600">{report.quantity}</span>
                          <span className="text-xs text-gray-400 ml-1">unit</span>
                        </td>
                      )}
                      {!isYear && (
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-gray-600">{formatCurrency(report.cost_total)}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(report.revenue)}</span>
                      </td>
                      {!isYear && (
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${(report.revenue - report.cost_total) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(report.revenue - report.cost_total)}
                          </span>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
            {/* Total Footer */}
            {!isLoading && filteredReports.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-indigo-200 bg-indigo-50">
                  {/* No */}
                  <td className="px-4 py-3.5"></td>
                  {/* Waktu/Bulan */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Total</span>
                  </td>
                  {/* Nama Produk (only non-year) */}
                  {!isYear && (
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-indigo-500">{filteredReports.length} baris data</span>
                    </td>
                  )}
                  {/* Pembayaran (only non-year) — centered */}
                  {!isYear && <td className="px-4 py-3.5"></td>}
                  {/* Item Terjual (only non-year) — centered */}
                  {!isYear && (
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-bold text-indigo-700">{totalProductsSold}</span>
                      <span className="text-xs text-indigo-500 ml-1">unit</span>
                    </td>
                  )}
                  {/* Modal (only non-year) */}
                  {!isYear && (
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-base font-extrabold text-gray-700">{formatCurrency(totalCostPrice)}</span>
                    </td>
                  )}
                  {/* Pendapatan */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-base font-extrabold text-indigo-700">{formatCurrency(totalRevenue)}</span>
                  </td>
                  {/* Margin (only non-year) */}
                  {!isYear && (
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-base font-extrabold ${totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(totalMargin)}
                      </span>
                    </td>
                  )}
                </tr>
                {/* Margin Summary Row */}
                {!isYear && (
                  <tr className="border-t border-indigo-100 bg-emerald-50/60">
                    <td className="px-4 py-3"></td>
                    <td colSpan={5} className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Margin Keuntungan</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-base font-extrabold ${totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(totalMargin)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {marginPercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )}
               </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 print:hidden">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> hingga{' '}
              <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)}</span> dari{' '}
              <span className="font-medium text-gray-900">{filteredReports.length}</span> data
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
