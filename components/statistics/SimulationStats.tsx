'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrentStats } from '@/types'
import { Users, Sword, Crown } from 'lucide-react'

interface SimulationStatsProps {
  stats: CurrentStats
}

export function SimulationStats({ stats }: SimulationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stats.year > 0 ? `第 ${stats.year} 年` : "等待开始"}</p>
              <p className="text-2xl font-bold text-primary">总修士数</p>
              <p className="text-3xl font-bold">{stats.totalCultivators}</p>
            </div>
            <Users className="w-8 h-8 text-primary/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">单人最高击杀数</p>
              <p className="text-2xl font-bold text-accent">最多击杀</p>
              <p className="text-3xl font-bold">{stats.maxKills}</p>
            </div>
            <Sword className="w-8 h-8 text-accent/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stats.year > 0 ? "本年陨落" : "死亡统计"}</p>
              <p className="text-2xl font-bold text-destructive">死亡人数</p>
              <p className="text-3xl font-bold">{stats.deaths}</p>
            </div>
            <Crown className="w-8 h-8 text-destructive/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">最高境界</p>
              <p className="text-2xl font-bold text-primary">{stats.highestRealm}</p>
              <p className="text-lg font-semibold">{stats.highestRealmCount} 人</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">仙</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}