'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartData } from '@/types'
import { useMemo } from 'react'

interface CultivatorChartProps {
  data: ChartData[]
}

export function CultivatorChart({ data }: CultivatorChartProps) {
  // 动态采样逻辑：当数据点超过60时，采样到50个点
  const sampledData = useMemo(() => {
    if (data.length <= 60) {
      return data
    }

    const maxSamples = 50
    const step = Math.floor(data.length / maxSamples)
    const sampled: ChartData[] = []

    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i])
    }

    // 确保包含最后一个数据点
    if (data.length > 0 && sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1])
    }

    return sampled
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>修士数量变化</CardTitle>
        <CardDescription>
          历年修士总数变化趋势
          {data.length > 60 && (
            <span className="text-xs text-muted-foreground ml-2">
              (已采样显示 {sampledData.length} 个数据点)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cultivators: {
              label: "修士数量",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampledData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="cultivators"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}