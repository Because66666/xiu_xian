"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Play, Pause, RotateCcw, Sword, Crown, Users, TrendingUp, Github } from "lucide-react"
import { useSimulation } from "@/hooks/useSimulation"
import { CultivationLevels } from "@/constants/cultivation"
import { getCurrentStats, getSampledChartData, getLevelDistributionChartData } from "@/utils/simulation"
import { CultivatorChart, LevelDistributionChart } from "@/components/charts"
import { SimulationStats, CultivatorCard } from "@/components/statistics"
import { SystemLog } from "@/components/system-log"

export default function CultivationSimulator() {
  const {
    simulationYears,
    setSimulationYears,
    absorptionRate,
    setAbsorptionRate,
    isRunning,
    isPaused,
    currentYear,
    simulationData,
    currentData,
    systemLogs,
    runSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
  } = useSimulation()

  // 计算统计数据
  const stats = getCurrentStats(currentData)
  const strongest = currentData ? currentData.cultivators.reduce((strongest, current) =>
    current.cultivation_points > strongest.cultivation_points ? current : strongest
  ) : null
  const topKiller = currentData ? currentData.cultivators.reduce((topKiller, current) =>
    current.defeats_count > topKiller.defeats_count ? current : topKiller
  ) : null

  // 图表数据
  const chartData = simulationData.map((data) => ({
    year: data.year,
    cultivators: data.total_cultivators,
  }))
  const levelDistributionChartData = getLevelDistributionChartData(currentData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Sword className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">修仙世界模拟器</h1>
            </div>
            <p className="text-muted-foreground">体验修仙世界的残酷与辉煌，见证修士们的成长与陨落</p>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute top-6 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="GitHub"
          >
            <Github className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              模拟控制台
            </CardTitle>
            <CardDescription>设置模拟参数并开始您的修仙世界之旅</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="years">模拟时长（年）</Label>
                <Input
                  id="years"
                  type="number"
                  value={simulationYears}
                  onChange={(e) => setSimulationYears(Number(e.target.value))}
                  disabled={isRunning || isPaused}
                  min="1"
                  max="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="absorption">修为吸取比率</Label>
                <Input
                  id="absorption"
                  type="number"
                  step="0.01"
                  value={absorptionRate}
                  onChange={(e) => setAbsorptionRate(Number(e.target.value))}
                  disabled={isRunning || isPaused}
                  min="0.01"
                  max="1"
                />
              </div>
              <div className="flex items-end gap-2">
                {!isRunning && !isPaused && (
                  <Button onClick={runSimulation} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    开始模拟
                  </Button>
                )}
                {isRunning && (
                  <Button onClick={pauseSimulation} variant="secondary" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    暂停模拟
                  </Button>
                )}
                {isPaused && (
                  <Button onClick={resumeSimulation} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    继续模拟
                  </Button>
                )}
                <Button variant="outline" onClick={resetSimulation}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {(isRunning || isPaused) && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>进度 {isPaused && <span className="text-amber-600">(已暂停)</span>}</span>
                  <span>
                    {currentYear} / {simulationYears} 年
                  </span>
                </div>
                <Progress value={(currentYear / simulationYears) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <SimulationStats stats={stats} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="charts">图表分析</TabsTrigger>
            <TabsTrigger value="cultivators">修士详情</TabsTrigger>
            <TabsTrigger value="logs">系统日志</TabsTrigger>
            <TabsTrigger value="statistics">统计数据</TabsTrigger>
            
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {currentData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>第{currentData.year}年修仙界状况</CardTitle>
                    <CardDescription>当前修仙界的详细统计信息</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-primary/5">
                          <div className="text-2xl font-bold text-primary">{currentData.total_cultivators}</div>
                          <div className="text-sm text-muted-foreground">总修士数量</div>
                        </div>
                        {Object.entries(currentData.level_distribution)
                          .filter(([_, count]) => count > 0)
                          .map(([level, count]) => (
                            <div key={level} className="text-center p-4 rounded-lg bg-muted/50">
                              <div className="text-2xl font-bold text-primary">{count}</div>
                              <div className="text-sm text-muted-foreground">{level}期修士</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {strongest && (
                    <CultivatorCard 
                      cultivator={strongest} 
                      title="最强修士详情" 
                      icon={<Crown className="w-5 h-5 text-primary" />}
                      borderColor="border-primary/20"
                    />
                  )}

                  {topKiller && (
                    <CultivatorCard 
                      cultivator={topKiller} 
                      title="杀戮之王" 
                      icon={<Sword className="w-5 h-5 text-accent" />}
                      borderColor="border-accent/20"
                    />
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CultivatorChart data={chartData} />
              <LevelDistributionChart data={levelDistributionChartData} currentYear={currentData?.year} />
            </div>
          </TabsContent>

          <TabsContent value="cultivators" className="space-y-6">
            {currentData?.cultivators && (
              <Card>
                <CardHeader>
                  <CardTitle>修士列表</CardTitle>
                  <CardDescription>当前存活的修士详细信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">编号</th>
                          <th className="text-left p-2">境界</th>
                          <th className="text-left p-2">修为</th>
                          <th className="text-left p-2">年龄</th>
                          <th className="text-left p-2">击败</th>
                          <th className="text-left p-2">已过寿元比率</th>
                          <th className="text-left p-2">勇气</th>
                          <th className="text-left p-2">出生年</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.cultivators
                          .sort((a, b) => b.cultivation_points - a.cultivation_points)
                          .slice(0, 50)
                          .map((cultivator) => (
                            <tr key={cultivator.id} className="border-b hover:bg-muted/50">
                              <td className="p-2">{cultivator.id}</td>
                              <td className="p-2">
                                <Badge variant="outline">{CultivationLevels[cultivator.level as keyof typeof CultivationLevels].name}期</Badge>
                              </td>
                              <td className="p-2 font-mono">{cultivator.cultivation_points.toLocaleString()}</td>
                              <td className="p-2">{cultivator.age}岁</td>
                              <td className="p-2 text-accent font-bold">{cultivator.defeats_count}</td>
                              <td className="p-2">{((cultivator.age / cultivator.max_lifespan) * 100).toFixed(2)}%</td>
                              <td className="p-2">{cultivator.courage.toFixed(3)}</td>
                              <td className="p-2">第{cultivator.birth_year}年</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {simulationData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>模拟统计摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>总模拟年数:</span>
                      <span className="font-bold">{simulationData.length} 年</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总战斗次数:</span>
                      <span className="font-bold">
                        {simulationData.reduce((sum, data) => sum + data.battles, 0)} 次
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>修士整体平均勇气值:</span>
                      <span className="font-bold text-primary">
                        {currentData && currentData.cultivators.length > 0 
                          ? (currentData.cultivators.reduce((sum, c) => sum + c.courage, 0) / currentData.cultivators.length).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>自然寿终比率:</span>
                      <span className="font-bold text-amber-600">
                        {currentData && currentData.cultivators.length > 0
                          ? ((currentData.cultivators.filter(c => c.age >= c.max_lifespan * 1.0).length / currentData.cultivators.length) * 100).toFixed(2)
                          : '0.00'
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均每年战斗:</span>
                      <span className="font-bold">
                        {(simulationData.reduce((sum, data) => sum + data.battles, 0) / simulationData.length).toFixed(
                          1,
                        )}{" "}
                        次
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>修为吸取设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>吸取比率:</span>
                      <span className="font-bold">{(absorptionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>每次战斗胜利后，胜者将吸收败者 {(absorptionRate * 100).toFixed(1)}% 的修为点数。</p>
                      <p className="mt-2">这个机制促进了修仙界的竞争与成长，强者愈强，弱者淘汰。</p>
                    </div>
                  </CardContent>
                </Card>

                {currentData && (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>各阶级修士详细统计</CardTitle>
                      <CardDescription>第{currentData.year}年各修为阶段修士的平均数据</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">修为阶段</th>
                              <th className="text-left p-3">修士数量</th>
                              <th className="text-left p-3">平均勇气值</th>
                              <th className="text-left p-3">平均战斗次数</th>
                              <th className="text-left p-3">平均剩余寿元</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(CultivationLevels)
                              .filter(([levelKey]) => parseInt(levelKey) !== 0) // 过滤掉练气期
                              .map(([levelKey, levelInfo]) => {
                                const levelCultivators = currentData.cultivators.filter(
                                  c => c.level === parseInt(levelKey)
                                );
                                const count = levelCultivators.length;
                                const avgCourage = count > 0 
                                  ? (levelCultivators.reduce((sum, c) => sum + c.courage, 0) / count).toFixed(2)
                                  : '0.00';
                                const avgBattles = count > 0
                                  ? (levelCultivators.reduce((sum, c) => sum + c.battles_count, 0) / count).toFixed(2)
                                  : '0.00';
                                const avgRemainingLifespan = count > 0
                                  ? (levelCultivators.reduce((sum, c) => sum + (c.max_lifespan - c.age), 0) / count).toFixed(2)
                                  : '0.00';
                                
                                return (
                                  <tr key={levelKey} className="border-b hover:bg-muted/50">
                                    <td className="p-3">
                                      <Badge 
                                        variant="outline" 
                                        style={{ borderColor: levelInfo.color, color: levelInfo.color }}
                                      >
                                        {levelInfo.name}期
                                      </Badge>
                                    </td>
                                    <td className="p-3 font-bold">{count}</td>
                                    <td className="p-3">{avgCourage}</td>
                                    <td className="p-3">{avgBattles}</td>
                                    <td className="p-3">{avgRemainingLifespan}年</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <SystemLog logs={systemLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
