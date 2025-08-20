// 修仙者接口
export interface Cultivator {
  id: number
  age: number
  cultivation_points: number
  level: number
  courage: number
  max_lifespan: number
  is_alive: boolean
  defeats_count: number
  battles_count: number
  birth_year: number
  start_cultivation_age: number
}

// 模拟数据接口
export interface SimulationData {
  year: number
  cultivators: Cultivator[]
  total_cultivators: number
  battles: number
  deaths: number
  level_distribution: Record<string, number>
  level_stats: Record<string, {
    avg_courage: number
    avg_battles: number
    avg_lifespan: number
    count: number
  }>
}

// 系统日志接口
export interface SystemLog {
  year: number
  type: 'strongest_change' | 'killer_change'
  message: string
  oldCultivator?: {
    id: number
    name: string
    level: string
    cultivation_points: number
    defeats_count: number
  }
  newCultivator: {
    id: number
    name: string
    level: string
    cultivation_points: number
    defeats_count: number
  }
  reason: string
}

// 修炼等级配置接口
export interface CultivationLevel {
  name: string
  color: string
  required: number
  lifespan: number
}

// 图表数据接口
export interface ChartData {
  year: number
  cultivators: number
  battles?: number
  deaths?: number
}

// 等级分布图表数据接口
export interface LevelDistributionData {
  level: string
  count: number
  color: string
}

// 模拟状态接口
export interface SimulationState {
  cultivators: Cultivator[]
  nextId: number
  year: number
}

// 当前统计数据接口
export interface CurrentStats {
  year: number
  totalCultivators: number
  battles: number
  deaths: number
  highestRealm: string
  highestRealmCount: number
  maxKills: number
}

// 模拟参数接口
export interface SimulationParams {
  simulationYears: number
  absorptionRate: number
}

// 模拟控制接口
export interface SimulationControls {
  isRunning: boolean
  isPaused: boolean
  runSimulation: () => void
  pauseSimulation: () => void
  resumeSimulation: () => void
  resetSimulation: () => void
}