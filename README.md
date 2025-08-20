# 修仙世界模拟器（Python + TypeScript）

一个以修仙世界为背景的模拟器项目，包含：
- TypeScript/Next.js 前端可视化应用（实时图表、统计、系统日志等）
- Python 参考实现（核心规则与原型验证）

本项目旨在通过模拟修士的成长、战斗、境界提升与淘汰，呈现一个充满博弈与演化的修仙生态。

## 功能特性
- 修士生成、成长与寿元机制
- 按境界与修为计算的战斗系统与胜率判定
- 胜者吸收失败者修为（可配置比率）
- 最强修士、杀戮之王等头衔追踪与系统日志
- 多维统计与实时图表（修士总量、境界分布、最多击杀等）
- 交互式控制：开始、暂停、继续、重置模拟

## 目录结构
```
修仙模拟/
├── python/                  # Python 参考实现
│   ├── README.md
│   └── cultivation_simulator.py
├── typescript/              # TypeScript/Next.js 前端应用
│   └── xiu_xian/
│       ├── app/             # 主页面与路由
│       ├── components/      # 图表、统计、系统日志与基础 UI 组件
│       ├── constants/       # 修炼相关常量配置
│       ├── hooks/           # 模拟核心逻辑（useSimulation）
│       ├── types/           # TypeScript 类型定义
│       ├── utils/           # 工具函数（统计、采样、格式化等）
│       ├── package.json
│       └── ARCHITECTURE.md  # 架构说明文档
└── 背景信息.md               # 规则背景与世界观设定
```

## 快速开始

### 1) 运行 TypeScript/Next.js 前端
前置要求：Node.js 18+、npm

```bash
# 进入前端目录
cd typescript/xiu_xian

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev
```

### 2) 运行 Python 参考实现
前置要求：Python 3.10+

```bash
# 进入 python 目录
cd python

# 直接运行参考脚本（如需，可自行创建虚拟环境）
python cultivation_simulator.py
```

> 说明：两端相互独立。Python 版本更偏向规则原型验证；TypeScript 版本提供图形化与交互式体验。

## 使用说明（前端）
- 模拟控制台：设置模拟年数与修为吸取比率，控制开始/暂停/继续/重置
- 统计摘要：展示当前总修士、死亡、最高境界、最多击杀等指标
- 图表分析：修士数量趋势、境界分布
- 修士详情：列表查看修为、境界、击败次数、年龄等
- 系统日志：追踪最强修士/杀戮之王更迭，明确“谁被谁击杀”及双方境界

更多细节请参考 <ARCHITECTURE.md> 与源码注释。

## 开发指南
- 代码风格：TypeScript 严格类型、尽量保持纯函数与可测试性
- 组件分层：UI 展示与业务逻辑解耦，复用 hooks 与 utils
- 提交规范：建议使用清晰的提交信息（feat/fix/docs/refactor/perf/chore 等）

## 常见问题
- 端口占用：如 3000 端口被占用，可在启动前设置 PORT 环境变量
- 性能：大规模数据时启用采样与分片渲染，避免长列表同步渲染

## 许可协议（License）
本项目采用 Creative Commons 署名-非商业性使用 4.0 国际许可协议（CC BY-NC 4.0）。
- 允许复制、分发、展示及演绎，但必须保留署名。
- 严禁任何形式的商业使用（包括但不限于直接或间接盈利、付费分发、嵌入付费产品/平台等）。
- 完整协议条款参见：https://creativecommons.org/licenses/by-nc/4.0/deed.zh-Hans

在遵守上述条款的前提下，你可以自由地分享与改作本项目；若需商业授权，请先与作者联系。

## 免责声明
- 本项目仅用于学习与研究目的，不对使用结果做任何保证。
- 模拟规则与参数仅为虚构设定，与现实无关。

## 致谢
- Next.js、React、TypeScript、Tailwind CSS、shadcn/ui、Recharts 等优秀开源项目
- 所有反馈与贡献者