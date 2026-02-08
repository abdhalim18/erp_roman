'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartData } from '@/app/actions/dashboard'

interface DashboardChartsProps {
    data: ChartData[]
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Revenue & Profit</CardTitle>
                    <CardDescription>No data available for the last 30 days.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Revenue & Profit (Last 30 Days)</CardTitle>
                <CardDescription>Daily revenue compared to estimated profit.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: any) => [`Rp${Number(value).toLocaleString('id-ID')}`, undefined]}
                            labelStyle={{ color: '#333' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
