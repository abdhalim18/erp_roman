'use client'

import { useState } from 'react'
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react'
import type { ChartData } from '@/app/actions/dashboard'

interface DashboardChartsProps {
    data: ChartData[]
}

type ViewMode = 'bar' | 'area'

function formatRupiah(value: number) {
    if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`
    if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`
    return `Rp${value}`
}

function formatRupiahFull(value: number) {
    return `Rp${value.toLocaleString('id-ID')}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-4 min-w-[180px]">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">{label}</p>
                {payload.map((entry: any) => (
                    <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-gray-600">{entry.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                            {formatRupiahFull(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('bar')

    if (!data || data.length === 0) {
        return (
            <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-700">Grafik Pendapatan</CardTitle>
                    <CardDescription>Tidak ada data tersedia untuk 30 hari terakhir</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    // Summary stats
    const totalRevenue = data.reduce((s, d) => s + d.pendapatan, 0)

    // Only show some X-axis ticks to avoid crowding
    const tickInterval = Math.max(1, Math.floor(data.length / 8))
    const displayData = data.map((d, i) => ({
        ...d,
        displayDate: i % tickInterval === 0 ? d.date : '',
    }))

    return (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-4 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-semibold text-gray-800">
                            Grafik Pendapatan
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400 mt-0.5">
                            30 hari terakhir · diperbarui otomatis
                        </CardDescription>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
                        <button
                            onClick={() => setViewMode('bar')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${viewMode === 'bar'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <BarChart2 className="h-3.5 w-3.5" />
                            Batang
                        </button>
                        <button
                            onClick={() => setViewMode('area')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${viewMode === 'area'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Activity className="h-3.5 w-3.5" />
                            Area
                        </button>
                    </div>
                </div>

                {/* Mini Summary Stats */}
                <div className="mt-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100/60 max-w-sm">
                        <p className="text-[10px] font-medium text-blue-500 uppercase tracking-widest">Total Pendapatan (30 Hari)</p>
                        <p className="text-sm font-bold text-blue-900 mt-1">{formatRupiah(totalRevenue)}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 pb-2 px-4">
                <ResponsiveContainer width="100%" height={280}>
                    {viewMode === 'bar' ? (
                        <BarChart data={displayData} barGap={4} barCategoryGap="30%">
                            <defs>
                                <linearGradient id="gradPendapatan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                interval={tickInterval - 1}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickFormatter={formatRupiah}
                                width={58}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 6 }} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#6b7280' }}
                            />
                            <Bar
                                dataKey="pendapatan"
                                name="Pendapatan"
                                fill="url(#gradPendapatan)"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart data={displayData}>
                            <defs>
                                <linearGradient id="areaPendapatan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                interval={tickInterval - 1}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                tickFormatter={formatRupiah}
                                width={58}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#6b7280' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pendapatan"
                                name="Pendapatan"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                fill="url(#areaPendapatan)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
