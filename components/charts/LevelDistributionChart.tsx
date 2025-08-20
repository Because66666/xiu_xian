'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LevelDistributionData } from '@/types'

interface LevelDistributionChartProps {
  data: LevelDistributionData[]
  currentYear?: number
}

export function LevelDistributionChart({ data, currentYear }: LevelDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>各阶段修士数量</CardTitle>
        <CardDescription>
          {currentYear ? `第${currentYear}年各修为阶段修士分布` : "等待模拟开始"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "修士数量",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="level"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [value, "修士数量"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}