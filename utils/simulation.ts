import { Cultivator, CurrentStats, ChartData, LevelDistributionData, SimulationData } from '@/types'
import { CultivationLevels, HighestRealmNames } from '@/constants/cultivation'

/**
 * 生成正态分布随机数
 * @param mean 均值
 * @param stdDev 标准差
 * @returns 正态分布随机数
 */
export function normalRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z * stdDev + mean
}

/**
 * 获取最强修士
 * @param cultivators 修士数组
 * @returns 最强修士或null
 */
export function getStrongestCultivator(cultivators: Cultivator[]): Cultivator | null {
  if (!cultivators.length) return null
  return cultivators.reduce((strongest, current) =>
    current.cultivation_points > strongest.cultivation_points ? current : strongest
  )
}

/**
 * 获取杀戮之王
 * @param cultivators 修士数组
 * @returns 杀戮之王或null
 */
export function getTopKiller(cultivators: Cultivator[]): Cultivator | null {
  if (!cultivators.length) return null
  return cultivators.reduce((topKiller, current) =>
    current.defeats_count > topKiller.defeats_count ? current : topKiller
  )
}

/**
 * 获取当前统计数据
 * @param currentData 当前模拟数据
 * @returns 当前统计数据
 */
export function getCurrentStats(currentData: SimulationData | null): CurrentStats {
  if (!currentData) {
    return {
      year: 0,
      totalCultivators: 0,
      battles: 0,
      deaths: 0,
      highestRealm: "无",
      highestRealmCount: 0,
      maxKills: 0,
    }
  }

  let highestRealm = "无"
  let highestRealmCount = 0

  for (const realm of HighestRealmNames) {
    const count = currentData.level_distribution[realm] || 0
    if (count > 0) {
      highestRealm = realm + "期"
      highestRealmCount = count
      break
    }
  }

  // 计算最多击杀数
  const maxKills = currentData.cultivators.length > 0 
    ? Math.max(...currentData.cultivators.map(c => c.defeats_count))
    : 0

  return {
    year: currentData.year,
    totalCultivators: currentData.total_cultivators,
    battles: currentData.battles,
    deaths: currentData.deaths,
    highestRealm,
    highestRealmCount,
    maxKills,
  }
}

/**
 * 获取采样后的图表数据（用于性能优化）
 * @param simulationData 模拟数据数组
 * @param maxSamples 最大采样数量
 * @returns 采样后的图表数据
 */
export function getSampledChartData(simulationData: SimulationData[], maxSamples: number = 50): ChartData[] {
  if (simulationData.length <= maxSamples) {
    return simulationData.map((data) => ({
      year: data.year,
      cultivators: data.total_cultivators,
    }))
  }

  const step = Math.floor(simulationData.length / maxSamples)
  const sampledData: ChartData[] = []

  for (let i = 0; i < simulationData.length; i += step) {
    const data = simulationData[i]
    sampledData.push({
      year: data.year,
      cultivators: data.total_cultivators,
    })
  }

  // 确保包含最后一个数据点
  if (simulationData.length > 0) {
    const lastData = simulationData[simulationData.length - 1]
    if (sampledData[sampledData.length - 1]?.year !== lastData.year) {
      sampledData.push({
        year: lastData.year,
        cultivators: lastData.total_cultivators,
      })
    }
  }

  return sampledData
}

/**
 * 获取等级分布图表数据（过滤掉练气期）
 * @param currentData 当前模拟数据
 * @returns 等级分布图表数据
 */
export function getLevelDistributionChartData(currentData: SimulationData | null): LevelDistributionData[] {
  if (!currentData) {
    return Object.entries(CultivationLevels)
      .filter(([level]) => parseInt(level) !== 0) // 过滤掉练气期
      .map(([level, info]) => ({
        level: info.name + "期",
        count: 0,
        color: info.color,
      }))
  }

  return Object.entries(CultivationLevels)
    .filter(([level]) => parseInt(level) !== 0) // 过滤掉练气期
    .map(([level, info]) => ({
      level: info.name + "期",
      count: currentData.level_distribution[info.name] || 0,
      color: info.color,
    }))
}

/**
 * 限制数值在指定范围内
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 格式化数字显示
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}