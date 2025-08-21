// 修仙者接口
/**
 * 修士接口定义
 * 描述修仙世界中每个修士的基本属性和状态
 */
export interface Cultivator {
  /** 修士唯一标识符 */
  id: number
  /** 修士当前年龄 */
  age: number
  /** 修士当前修为点数，用于判断修炼等级和战斗力 */
  cultivation_points: number
  /** 修士当前修炼等级（0-7，对应不同境界） */
  level: number
  /** 修士勇气值（0-1），影响是否参与战斗的决策 */
  courage: number
  /** 修士最大寿命，根据修炼等级确定 */
  max_lifespan: number
  /** 修士是否存活状态 */
  is_alive: boolean
  /** 修士击败其他修士的次数，用于确定杀戮之王 */
  defeats_count: number
  /** 修士出生年份，用于计算年龄和统计 */
  birth_year: number
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

// 轻量级历史数据接口（用于趋势图表）
export interface HistoricalData {
  year: number
  total_cultivators: number
  battles: number
  deaths: number
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