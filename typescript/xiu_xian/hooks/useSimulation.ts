import { useState, useRef, useCallback } from 'react'
import { Cultivator, SimulationData, SystemLog, SimulationState, SimulationParams } from '@/types'
import { CultivationLevels, CULTIVATOR_GENERATION, BATTLE_PARAMS } from '@/constants/cultivation'
import { normalRandom, clamp } from '@/utils/simulation'

export function useSimulation() {
  // 基础状态
  const [simulationYears, setSimulationYears] = useState(100)
  const [absorptionRate, setAbsorptionRate] = useState(0.1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentYear, setCurrentYear] = useState(0)
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])
  const [currentData, setCurrentData] = useState<SimulationData | null>(null)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])

  // 引用状态
  const simulationStateRef = useRef<SimulationState | null>(null)
  const shouldPauseRef = useRef(false)

  // 创建新修士
  const createNewCultivators = useCallback((currentSimYear: number, nextId: number): { cultivators: Cultivator[], newNextId: number } => {
    const cultivators: Cultivator[] = []
    let newNextId = nextId

    for (let i = 0; i < CULTIVATOR_GENERATION.yearlyCount; i++) {
      const startAge = Math.max(
        CULTIVATOR_GENERATION.startAgeMin,
        Math.min(
          CULTIVATOR_GENERATION.startAgeMax,
          Math.round(normalRandom(CULTIVATOR_GENERATION.startAgeMean, CULTIVATOR_GENERATION.startAgeStdDev))
        )
      )
      const foundationAge = startAge + CULTIVATOR_GENERATION.foundationAgeOffset

      cultivators.push({
        id: newNextId++,
        age: foundationAge,
        cultivation_points: CULTIVATOR_GENERATION.initialCultivationPoints,
        level: CULTIVATOR_GENERATION.initialLevel,
        courage: clamp(
          normalRandom(CULTIVATOR_GENERATION.courageMean, CULTIVATOR_GENERATION.courageStdDev),
          0,
          1
        ),
        max_lifespan: CultivationLevels[CULTIVATOR_GENERATION.initialLevel].lifespan,
        is_alive: true,
        defeats_count: 0,
        battles_count: 0,
        birth_year: currentSimYear - foundationAge,
        start_cultivation_age: startAge,
      })
    }

    return { cultivators, newNextId }
  }, [])

  // 更新修士年龄和修为
  const ageCultivators = useCallback((cultivators: Cultivator[]): Cultivator[] => {
    return cultivators.map((c) => ({
      ...c,
      age: c.age + 1,
      cultivation_points: c.cultivation_points + 1,
    }))
  }, [])

  // 更新修士等级
  const updateCultivatorLevels = useCallback((cultivators: Cultivator[]): Cultivator[] => {
    return cultivators.map((c) => {
      let newLevel = c.level
      for (let level = 7; level >= 0; level--) {
        if (c.cultivation_points >= CultivationLevels[level as keyof typeof CultivationLevels].required) {
          newLevel = level
          break
        }
      }
      return {
        ...c,
        level: newLevel,
        max_lifespan: CultivationLevels[newLevel as keyof typeof CultivationLevels].lifespan,
      }
    })
  }, [])

  // 处理战斗
  const processBattles = useCallback((cultivators: Cultivator[], absorptionRate: number): { cultivators: Cultivator[], battles: number, deaths: number } => {
    let yearlyBattles = 0
    let yearlyDeaths = 0
    const aliveCultivators = cultivators.filter(c => c.is_alive)

    // 按等级分组
    const levelGroups: Record<number, Cultivator[]> = {}
    aliveCultivators.forEach((c) => {
      if (!levelGroups[c.level]) levelGroups[c.level] = []
      levelGroups[c.level].push(c)
    })

    const totalCultivators = aliveCultivators.length

    Object.entries(levelGroups).forEach(([levelStr, levelCultivators]) => {
      const encounterProbability = levelCultivators.length / totalCultivators

      levelCultivators.forEach((cultivator) => {
        if (!cultivator.is_alive) return

        if (Math.random() < encounterProbability * BATTLE_PARAMS.encounterProbabilityMultiplier) {
          const opponent = levelCultivators[Math.floor(Math.random() * levelCultivators.length)]
          if (opponent.id !== cultivator.id && opponent.is_alive) {
            const totalPower = cultivator.cultivation_points + opponent.cultivation_points
            const winProbability = cultivator.cultivation_points / totalPower
            const defeatProbability = 1 - winProbability

            if (cultivator.courage > defeatProbability) {
              yearlyBattles++
              cultivator.battles_count++
              opponent.battles_count++

              if (Math.random() < winProbability) {
                const absorbedPower = Math.floor(opponent.cultivation_points * absorptionRate)
                cultivator.cultivation_points += absorbedPower
                cultivator.defeats_count++
                opponent.is_alive = false
                yearlyDeaths++
              } else {
                const absorbedPower = Math.floor(cultivator.cultivation_points * absorptionRate)
                opponent.cultivation_points += absorbedPower
                opponent.defeats_count++
                cultivator.is_alive = false
                yearlyDeaths++
              }
            }
          }
        }
      })
    })

    return {
      cultivators: cultivators.filter((c) => c.is_alive),
      battles: yearlyBattles,
      deaths: yearlyDeaths
    }
  }, [])

  // 计算统计数据
  const calculateStats = useCallback((cultivators: Cultivator[]) => {
    const levelDistribution: Record<string, number> = {}
    const levelStats: Record<string, { avg_courage: number; avg_battles: number; avg_lifespan: number; count: number }> = {}

    // 初始化统计数据
    Object.values(CultivationLevels).forEach((level) => {
      levelDistribution[level.name] = 0
      levelStats[level.name] = { avg_courage: 0, avg_battles: 0, avg_lifespan: 0, count: 0 }
    })

    // 计算分布
    cultivators.forEach((c) => {
      const levelName = CultivationLevels[c.level as keyof typeof CultivationLevels].name
      levelDistribution[levelName]++
      levelStats[levelName].count++
    })

    // 计算平均值
    Object.keys(levelStats).forEach((levelName) => {
      const levelCultivators = cultivators.filter(
        (c) => CultivationLevels[c.level as keyof typeof CultivationLevels].name === levelName
      )
      if (levelCultivators.length > 0) {
        levelStats[levelName].avg_courage =
          levelCultivators.reduce((sum, c) => sum + c.courage, 0) / levelCultivators.length
        levelStats[levelName].avg_battles =
          levelCultivators.reduce((sum, c) => sum + c.battles_count, 0) / levelCultivators.length
        levelStats[levelName].avg_lifespan =
          levelCultivators.reduce((sum, c) => sum + (c.max_lifespan - c.age), 0) / levelCultivators.length
      }
    })

    return { levelDistribution, levelStats }
  }, [])

  // 追踪最强修士和杀戮之王变化
  const trackChanges = useCallback((cultivators: Cultivator[], currentSimYear: number, prevData: SimulationData | null) => {
    const aliveCultivators = cultivators.filter(c => c.is_alive)
    if (aliveCultivators.length === 0) return

    const currentStrongest = aliveCultivators.reduce((strongest, current) => 
      current.cultivation_points > strongest.cultivation_points ? current : strongest
    )
    const currentTopKiller = aliveCultivators.reduce((topKiller, current) => 
      current.defeats_count > topKiller.defeats_count ? current : topKiller
    )

    // 如果是第一年，记录初始状态
    if (!prevData) {
      setSystemLogs(prev => [...prev, {
        year: currentSimYear,
        type: 'strongest_change',
        message: `修仙世界开启：修士${currentStrongest.id}成为初代最强修士`,
        newCultivator: {
          id: currentStrongest.id,
          name: `修士${currentStrongest.id}`,
          level: CultivationLevels[currentStrongest.level as keyof typeof CultivationLevels]?.name || '未知',
          cultivation_points: currentStrongest.cultivation_points,
          defeats_count: currentStrongest.defeats_count
        },
        reason: '修仙世界初始化'
      }])
      
      if (currentTopKiller.defeats_count > 0) {
        setSystemLogs(prev => [...prev, {
          year: currentSimYear,
          type: 'killer_change',
          message: `修士${currentTopKiller.id}成为初代杀戮之王`,
          newCultivator: {
            id: currentTopKiller.id,
            name: `修士${currentTopKiller.id}`,
            level: CultivationLevels[currentTopKiller.level as keyof typeof CultivationLevels]?.name || '未知',
            cultivation_points: currentTopKiller.cultivation_points,
            defeats_count: currentTopKiller.defeats_count
          },
          reason: `首次击败${currentTopKiller.defeats_count}人`
        }])
      }
      return
    }

    const prevAliveCultivators = prevData.cultivators.filter(c => c.is_alive)
    if (prevAliveCultivators.length === 0) return

    const prevStrongest = prevAliveCultivators.reduce((strongest, current) => 
      current.cultivation_points > strongest.cultivation_points ? current : strongest
    )
    const prevTopKiller = prevAliveCultivators.reduce((topKiller, current) => 
      current.defeats_count > topKiller.defeats_count ? current : topKiller
    )

    // 最强修士变化
    if (currentStrongest.id !== prevStrongest.id) {
      // 检查前任最强修士是否还活着
      const prevStrongestStillAlive = aliveCultivators.find(c => c.id === prevStrongest.id)
      let reason: string
      let message: string
      
      if (!prevStrongestStillAlive) {
        // 查找击杀者：找到击败人数比上一年增加的修士
        const killer = aliveCultivators.find(c => {
          const prevCultivator = prevAliveCultivators.find(pc => pc.id === c.id)
          return prevCultivator && c.defeats_count > prevCultivator.defeats_count
        })
        
        if (killer) {
          const prevStrongestLevel = CultivationLevels[prevStrongest.level as keyof typeof CultivationLevels]?.name || '未知'
          const killerLevel = CultivationLevels[killer.level as keyof typeof CultivationLevels]?.name || '未知'
          reason = `前任最强修士（${prevStrongestLevel}期）被修士${killer.id}（${killerLevel}期）击杀`
          message = `最强修士更迭：修士${prevStrongest.id}被修士${killer.id}击杀，修士${currentStrongest.id}继承最强之位`
        } else {
          const prevStrongestLevel = CultivationLevels[prevStrongest.level as keyof typeof CultivationLevels]?.name || '未知'
          reason = `前任最强修士（${prevStrongestLevel}期）死亡（寿元耗尽）`
          message = `最强修士更迭：修士${prevStrongest.id}寿元耗尽死亡，修士${currentStrongest.id}继承最强之位`
        }
      } else {
        // 前任还活着，比较修为
        const currentPrevStrongest = aliveCultivators.find(c => c.id === prevStrongest.id)!
        if (currentStrongest.cultivation_points > currentPrevStrongest.cultivation_points) {
          reason = `修为超越前任最强修士（${currentStrongest.cultivation_points} > ${currentPrevStrongest.cultivation_points}）`
          message = `最强修士更迭：修士${currentStrongest.id}修为突破，超越修士${prevStrongest.id}成为新的最强修士`
        } else {
          reason = `前任最强修士实力下降`
          message = `最强修士更迭：修士${currentStrongest.id}取代修士${prevStrongest.id}成为新的最强修士`
        }
      }
      
      setSystemLogs(prev => [...prev, {
        year: currentSimYear,
        type: 'strongest_change',
        message,
        oldCultivator: {
          id: prevStrongest.id,
          name: `修士${prevStrongest.id}`,
          level: CultivationLevels[prevStrongest.level as keyof typeof CultivationLevels]?.name || '未知',
          cultivation_points: prevStrongest.cultivation_points,
          defeats_count: prevStrongest.defeats_count
        },
        newCultivator: {
          id: currentStrongest.id,
          name: `修士${currentStrongest.id}`,
          level: CultivationLevels[currentStrongest.level as keyof typeof CultivationLevels]?.name || '未知',
          cultivation_points: currentStrongest.cultivation_points,
          defeats_count: currentStrongest.defeats_count
        },
        reason
      }])
    }

    // 杀戮之王变化
    if (currentTopKiller.id !== prevTopKiller.id && currentTopKiller.defeats_count > 0) {
      // 检查前任杀戮之王是否还活着
      const prevTopKillerStillAlive = aliveCultivators.find(c => c.id === prevTopKiller.id)
      let reason: string
      let message: string
      
      if (!prevTopKillerStillAlive) {
        // 查找击杀者：找到击败人数比上一年增加的修士
        const killer = aliveCultivators.find(c => {
          const prevCultivator = prevAliveCultivators.find(pc => pc.id === c.id)
          return prevCultivator && c.defeats_count > prevCultivator.defeats_count
        })
        
        if (killer) {
          const prevTopKillerLevel = CultivationLevels[prevTopKiller.level as keyof typeof CultivationLevels]?.name || '未知'
          const killerLevel = CultivationLevels[killer.level as keyof typeof CultivationLevels]?.name || '未知'
          reason = `前任杀戮之王（${prevTopKillerLevel}期）被修士${killer.id}（${killerLevel}期）击杀`
          message = `杀戮之王更迭：修士${prevTopKiller.id}被修士${killer.id}击杀，修士${currentTopKiller.id}继承杀戮之王之位`
        } else {
          const prevTopKillerLevel = CultivationLevels[prevTopKiller.level as keyof typeof CultivationLevels]?.name || '未知'
          reason = `前任杀戮之王（${prevTopKillerLevel}期）死亡（寿元耗尽）`
          message = `杀戮之王更迭：修士${prevTopKiller.id}寿元耗尽死亡，修士${currentTopKiller.id}继承杀戮之王之位`
        }
      } else {
        // 前任还活着，比较击败人数
        const currentPrevTopKiller = aliveCultivators.find(c => c.id === prevTopKiller.id)!
        if (currentTopKiller.defeats_count > currentPrevTopKiller.defeats_count) {
          reason = `击败人数超越前任杀戮之王（${currentTopKiller.defeats_count} > ${currentPrevTopKiller.defeats_count}）`
          message = `杀戮之王更迭：修士${currentTopKiller.id}击败更多对手，超越修士${prevTopKiller.id}成为新的杀戮之王`
        } else {
          reason = `前任杀戮之王击败人数下降`
          message = `杀戮之王更迭：修士${currentTopKiller.id}取代修士${prevTopKiller.id}成为新的杀戮之王`
        }
      }
      
      setSystemLogs(prev => [...prev, {
        year: currentSimYear,
        type: 'killer_change',
        message,
        oldCultivator: {
          id: prevTopKiller.id,
          name: `修士${prevTopKiller.id}`,
          level: CultivationLevels[prevTopKiller.level as keyof typeof CultivationLevels]?.name || '未知',
          cultivation_points: prevTopKiller.cultivation_points,
          defeats_count: prevTopKiller.defeats_count
        },
        newCultivator: {
          id: currentTopKiller.id,
          name: `修士${currentTopKiller.id}`,
          level: CultivationLevels[currentTopKiller.level as keyof typeof CultivationLevels]?.name || '未知',
          cultivation_points: currentTopKiller.cultivation_points,
          defeats_count: currentTopKiller.defeats_count
        },
        reason
      }])
    }
  }, [])

  // 继续模拟
  const continueSimulation = useCallback(async () => {
    if (!simulationStateRef.current) return

    setIsRunning(true)
    let { cultivators, nextId, year } = simulationStateRef.current

    for (let currentSimYear = year; currentSimYear <= simulationYears; currentSimYear++) {
      if (shouldPauseRef.current) {
        simulationStateRef.current = { cultivators, nextId, year: currentSimYear }
        return
      }

      await new Promise((resolve) => setTimeout(resolve, BATTLE_PARAMS.simulationDelay))

      // 创建新修士
      const { cultivators: newCultivators, newNextId } = createNewCultivators(currentSimYear, nextId)
      cultivators.push(...newCultivators)
      nextId = newNextId

      // 年龄增长和修为增长
      cultivators = ageCultivators(cultivators)

      // 更新等级
      cultivators = updateCultivatorLevels(cultivators)

      // 移除寿命耗尽的修士
      cultivators = cultivators.filter((c) => c.age <= c.max_lifespan)

      // 处理战斗
      const battleResult = processBattles(cultivators, absorptionRate)
      cultivators = battleResult.cultivators

      // 计算统计数据
      const { levelDistribution, levelStats } = calculateStats(cultivators)

      const mockData: SimulationData = {
        year: currentSimYear,
        cultivators: [...cultivators],
        total_cultivators: cultivators.length,
        battles: battleResult.battles,
        deaths: battleResult.deaths,
        level_distribution: levelDistribution,
        level_stats: levelStats,
      }

      // 追踪变化
      const prevData = simulationData[simulationData.length - 1] || null
      trackChanges(cultivators, currentSimYear, prevData)

      setCurrentYear(currentSimYear)
      setCurrentData(mockData)
      setSimulationData((prev) => [...prev, mockData])

      simulationStateRef.current = { cultivators, nextId, year: currentSimYear + 1 }
    }

    setIsRunning(false)
    setIsPaused(false)
    simulationStateRef.current = null
  }, [simulationYears, absorptionRate, createNewCultivators, ageCultivators, updateCultivatorLevels, processBattles, calculateStats, trackChanges, simulationData])

  // 开始模拟
  const runSimulation = useCallback(async () => {
    setIsRunning(true)
    setIsPaused(false)
    setCurrentYear(0)
    setSimulationData([])
    setSystemLogs([])
    shouldPauseRef.current = false

    const cultivators: Cultivator[] = []
    const nextId = 1

    simulationStateRef.current = { cultivators, nextId, year: 1 }

    continueSimulation()
  }, [continueSimulation])

  // 暂停模拟
  const pauseSimulation = useCallback(() => {
    shouldPauseRef.current = true
    setIsPaused(true)
    setIsRunning(false)
  }, [])

  // 恢复模拟
  const resumeSimulation = useCallback(() => {
    if (simulationStateRef.current) {
      setIsPaused(false)
      shouldPauseRef.current = false
      continueSimulation()
    }
  }, [continueSimulation])

  // 重置模拟
  const resetSimulation = useCallback(() => {
    shouldPauseRef.current = true
    setIsRunning(false)
    setSystemLogs([])
    setIsPaused(false)
    setCurrentYear(0)
    setSimulationData([])
    setCurrentData(null)
    simulationStateRef.current = null
  }, [])

  return {
    // 状态
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
    
    // 控制函数
    runSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
  }
}