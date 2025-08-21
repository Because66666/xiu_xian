'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartData } from '@/types'

interface CultivatorChartProps {
  data: ChartData[]
}

export function CultivatorChart({ data }: CultivatorChartProps) {
  // 使用传入的数据，采样已在父组件中完成
  const sampledData = data

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