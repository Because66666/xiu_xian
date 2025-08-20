import { CultivationLevel } from '@/types'

// 修炼等级配置
export const CultivationLevels: Record<number, CultivationLevel> = {
  0: { name: "炼气", color: "#9ca3af", required: 10, lifespan: 0 },
  1: { name: "筑基", color: "#6b7280", required: 100, lifespan: 100 },
  2: { name: "结丹", color: "#a16207", required: 1000, lifespan: 900 }, // 100 + 800
  3: { name: "元婴", color: "#dc2626", required: 10000, lifespan: 8900 }, // 900 + 8000
  4: { name: "化神", color: "#7c3aed", required: 100000, lifespan: 88900 }, // 8900 + 80000
  5: { name: "炼虚", color: "#059669", required: 1000000, lifespan: 888900 }, // 88900 + 800000
  6: { name: "合体", color: "#0891b2", required: 10000000, lifespan: 8888900 }, // 888900 + 8000000
  7: { name: "大乘", color: "#be185d", required: 100000000, lifespan: 8888900 }, // Max level
}

// 修炼等级名称数组（按等级排序）
export const CultivationLevelNames = Object.values(CultivationLevels).map(level => level.name)

// 最高等级修炼等级名称数组（用于统计显示，从高到低）
export const HighestRealmNames = ["大乘", "合体", "炼虚", "化神", "元婴", "结丹", "筑基", "炼气"]

// 默认模拟参数
export const DEFAULT_SIMULATION_PARAMS = {
  simulationYears: 100,
  absorptionRate: 0.1,
}

// 新修士生成参数
export const CULTIVATOR_GENERATION = {
  yearlyCount: 1000,
  startAgeMin: 6,
  startAgeMax: 10,
  startAgeMean: 8,
  startAgeStdDev: 1,
  foundationAgeOffset: 10,
  initialCultivationPoints: 100,
  initialLevel: 1,
  courageMean: 0.5,
  courageStdDev: 0.2,
}

// 战斗相关参数
export const BATTLE_PARAMS = {
  encounterProbabilityMultiplier: 0.1,
  simulationDelay: 50, // 模拟延迟（毫秒）
}