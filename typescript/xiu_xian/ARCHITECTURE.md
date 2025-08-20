# 修仙模拟器项目架构文档

## 项目概述

本项目是一个基于 Next.js 和 TypeScript 的修仙世界模拟器，通过模拟修士的成长、战斗和境界提升来展现修仙世界的生态系统。

## 架构设计原则

- **模块化**: 按功能将代码分离到不同的模块中
- **可维护性**: 清晰的代码结构和良好的类型定义
- **可扩展性**: 易于添加新功能和修改现有功能
- **关注点分离**: UI组件、业务逻辑、数据处理分离

## 目录结构

```
xiu_xian/
├── app/
│   └── page.tsx                 # 主页面组件（布局与组件组合；头部居中标题与右上角 GitHub 链接）
├── components/
│   ├── charts/                  # 图表组件
│   │   ├── CultivatorChart.tsx  # 修士数量趋势图
│   │   ├── LevelDistributionChart.tsx # 境界分布饼图
│   │   └── index.ts             # 图表组件导出
│   ├── statistics/              # 统计组件
│   │   ├── SimulationStats.tsx  # 模拟统计信息
│   │   ├── CultivatorCard.tsx   # 修士详情卡片
│   │   └── index.ts             # 统计组件导出
│   ├── system-log/              # 系统日志组件
│   │   ├── SystemLog.tsx        # 系统日志显示
│   │   └── index.ts             # 日志组件导出
│   └── ui/                      # 基础UI组件（shadcn/ui）
├── constants/
│   └── cultivation.ts           # 修炼相关常量配置
├── hooks/
│   └── useSimulation.ts         # 模拟逻辑自定义Hook
├── types/
│   └── index.ts                 # TypeScript类型定义
├── utils/
│   └── simulation.ts            # 模拟相关工具函数
└── ARCHITECTURE.md              # 本架构文档
```

## 核心模块说明

### 1. 类型定义 (`types/index.ts`)

定义了项目中使用的所有TypeScript接口和类型：

- `Cultivator`: 修士基本信息
- `SimulationData`: 模拟数据结构
- `SystemLog`: 系统日志结构
- `CultivationLevel`: 修炼境界定义
- `ChartData`: 图表数据结构
- `CurrentStats`: 当前统计信息（包含 maxKills：最多击杀数）
- `SimulationState`: 模拟状态
- `SimulationParams`: 模拟参数
- `SimulationControls`: 模拟控制接口

### 2. 常量配置 (`constants/cultivation.ts`)

集中管理修炼相关的配置：

- `CultivationLevels`: 修炼境界配置（名称、颜色、所需修为、寿命等）
- `DEFAULT_SIMULATION_PARAMS`: 默认模拟参数
- `CULTIVATOR_GENERATION_PARAMS`: 修士生成参数
- `BATTLE_PARAMS`: 战斗相关参数

### 3. 工具函数 (`utils/simulation.ts`)

提供模拟过程中需要的工具函数：

- `normalRandom()`: 正态分布随机数生成
- `getStrongestCultivator()`: 获取最强修士
- `getTopKiller()`: 获取杀戮之王
- `getCurrentStats()`: 获取当前统计信息（包含 maxKills 统计）
- `getSampledChartData()`: 获取采样后的图表数据
- `getLevelDistributionChartData()`: 获取境界分布图表数据
- `clamp()`: 数值限制函数
- `formatNumber()`: 数字格式化函数

### 4. 模拟逻辑 (`hooks/useSimulation.ts`)

核心的模拟逻辑自定义Hook，包含：

- **状态管理**: 管理模拟的所有状态
- **修士生成**: 创建新修士的逻辑
- **年龄增长**: 修士年龄和修为增长
- **境界提升**: 根据修为计算境界等级
- **战斗系统**: 修士间的战斗逻辑
- **统计计算**: 各种统计数据的计算
- **事件追踪**: 追踪最强修士和杀戮之王的变化
- **模拟控制**: 运行、暂停、重置等控制功能

### 5. UI组件

#### 图表组件 (`components/charts/`)
- `CultivatorChart`: 使用Recharts显示修士数量趋势
- `LevelDistributionChart`: 使用Recharts显示境界分布饼图

#### 统计组件 (`components/statistics/`)
- `SimulationStats`: 显示模拟的基本统计信息（包含“最多击杀”指标展示）
- `CultivatorCard`: 显示修士详细信息的卡片组件

#### 系统日志组件 (`components/system-log/`)
- `SystemLog`: 显示系统事件日志，包括最强修士和杀戮之王的更迭；若因被击杀，会在原因中标明“谁被谁击杀”以及双方修为等级

### 6. 主页面 (`app/page.tsx`)

重构后的主页面专注于：
- 头部布局：标题与副标题居中，右上角提供 GitHub 链接
- 组件布局和组合
- 从useSimulation Hook获取数据和控制函数
- 渲染各个功能组件
- 处理用户交互（按钮点击、参数调整等）

## 数据流

```
用户交互 → useSimulation Hook → 状态更新 → UI组件重新渲染
     ↑                                              ↓
     ←─────────── 工具函数处理 ←─────────── 数据计算
```

1. 用户通过UI组件触发操作
2. useSimulation Hook处理业务逻辑
3. 调用工具函数进行数据处理和计算
4. 更新状态触发组件重新渲染
5. UI组件显示最新数据

## 关键特性

### 模拟系统
- **实时模拟**: 每年50ms的模拟速度
- **大规模数据**: 支持数万修士同时模拟
- **复杂交互**: 修士间的战斗、成长、死亡等

### 数据可视化
- **趋势图表**: 显示修士数量变化趋势
- **分布图表**: 显示各境界修士分布
- **实时统计**: 实时更新的统计信息

### 事件系统
- **系统日志**: 记录重要事件
- **变更追踪**: 追踪最强修士和杀戮之王的变化
- **原因分析**: 分析变更的具体原因

## 性能优化

1. **数据采样**: 大量数据时对图表数据进行采样
2. **状态管理**: 使用useRef避免不必要的重渲染
3. **组件分离**: 将大组件拆分为小组件提高渲染效率
4. **类型安全**: TypeScript提供编译时类型检查

## 扩展指南

### 添加新的修炼境界
1. 在`constants/cultivation.ts`中的`CultivationLevels`添加新境界
2. 更新相关的类型定义
3. 测试模拟逻辑是否正常工作

### 添加新的统计指标
1. 在`types/index.ts`中更新`CurrentStats`接口
2. 在`utils/simulation.ts`中的`getCurrentStats`函数添加计算逻辑
3. 在UI组件中添加显示逻辑

### 添加新的事件类型
1. 在`types/index.ts`中更新`SystemLog`接口
2. 在`hooks/useSimulation.ts`中添加事件检测逻辑
3. 在`components/system-log/SystemLog.tsx`中添加显示逻辑

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI库**: shadcn/ui (基于Radix UI)
- **图表**: Recharts
- **样式**: Tailwind CSS
- **状态管理**: React Hooks

## 维护建议

1. **定期重构**: 当某个文件超过500行时考虑进一步拆分
2. **类型安全**: 始终保持严格的TypeScript类型检查
3. **测试覆盖**: 为核心业务逻辑添加单元测试
4. **文档更新**: 当架构发生变化时及时更新本文档
5. **性能监控**: 定期检查大数据量下的性能表现