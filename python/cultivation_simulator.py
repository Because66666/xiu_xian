import random
import numpy as np
from typing import List, Dict, Tuple
import matplotlib.pyplot as plt
from dataclasses import dataclass
from enum import Enum
import argparse

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

class CultivationLevel(Enum):
    """修炼等级枚举"""
    LIANQI = 0    # 炼气
    ZHUJI = 1     # 筑基
    JIEDAN = 2    # 结丹
    YUANYING = 3  # 元婴
    HUASHEN = 4   # 化神
    LIANXU = 5    # 炼虚
    HETI = 6      # 合体
    DACHENG = 7   # 大乘

@dataclass
class LevelConfig:
    """等级配置"""
    name: str
    required_cultivation: int  # 晋升所需总修为
    lifespan_bonus: int       # 晋升后增加的寿元
    base_lifespan: int        # 基础寿元

class SimulationConfig:
    """模拟配置类"""
    def __init__(self, simulation_years: int = 100, absorption_rate: float = 0.1):
        self.simulation_years = simulation_years  # 模拟时长（年）
        self.absorption_rate = absorption_rate    # 修为吸取比率
        self.new_cultivators_per_year = 1000     # 每年新增修士数量
        
    def get_starting_age(self) -> int:
        """获取开始修炼年龄（6-10岁正态分布）"""
        age = np.random.normal(8, 1)  # 均值8岁，标准差1
        return max(6, min(10, int(round(age))))  # 限制在6-10岁之间

class Cultivator:
    """修士类"""
    
    # 等级配置
    LEVEL_CONFIGS = {
        CultivationLevel.LIANQI: LevelConfig("炼气", 10, 0, 100),
        CultivationLevel.ZHUJI: LevelConfig("筑基", 100, 0, 100),
        CultivationLevel.JIEDAN: LevelConfig("结丹", 1000, 800, 100),
        CultivationLevel.YUANYING: LevelConfig("元婴", 10000, 8000, 100),
        CultivationLevel.HUASHEN: LevelConfig("化神", 100000, 80000, 100),
        CultivationLevel.LIANXU: LevelConfig("炼虚", 1000000, 800000, 100),
        CultivationLevel.HETI: LevelConfig("合体", 10000000, 8000000, 100),
        CultivationLevel.DACHENG: LevelConfig("大乘", 100000000, 80000000, 100),
    }
    
    def __init__(self, cultivator_id: int, config: SimulationConfig):
        self.id = cultivator_id
        self.config = config
        self.age = config.get_starting_age()  # 使用正态分布的开始年龄
        self.cultivation_points = 0  # 修为点数
        self.level = CultivationLevel.LIANQI
        self.courage = np.random.normal(0.5, 0.15)  # 勇气值，正态分布
        self.courage = max(0, min(1, self.courage))  # 限制在0-1之间
        self.max_lifespan = 100  # 最大寿元
        self.is_alive = True
        self.defeats_count = 0  # 击败敌人的数量
        self.battles_count = 0  # 参与战斗的次数
        self.birth_year = 0  # 出生年份，将在世界中设置
        
    def get_remaining_lifespan(self) -> int:
        """获取剩余寿元"""
        return max(0, self.max_lifespan - self.age)
    
    def can_advance(self) -> bool:
        """检查是否可以晋升"""
        if self.level == CultivationLevel.DACHENG:
            return False
        
        next_level = CultivationLevel(self.level.value + 1)
        required_cultivation = self.LEVEL_CONFIGS[next_level].required_cultivation
        
        return self.cultivation_points >= required_cultivation
    
    def advance_level(self):
        """晋升等级"""
        if not self.can_advance():
            return False
        
        next_level = CultivationLevel(self.level.value + 1)
        self.level = next_level
        
        # 增加寿元
        lifespan_bonus = self.LEVEL_CONFIGS[next_level].lifespan_bonus
        self.max_lifespan += lifespan_bonus
        
        return True
    
    def cultivate_yearly(self):
        """每年修炼，增加1点修为"""
        if self.is_alive:
            self.cultivation_points += 1
            self.age += 1
            
            # 检查是否寿元耗尽
            if self.age >= self.max_lifespan:
                self.is_alive = False
            
            # 自动晋升（如果可以）
            if self.can_advance():
                self.advance_level()
    
    def calculate_win_rate(self, opponent: 'Cultivator') -> float:
        """计算对战胜率"""
        total_cultivation = self.cultivation_points + opponent.cultivation_points
        if total_cultivation == 0:
            return 0.5
        return self.cultivation_points / total_cultivation
    
    def will_fight(self, opponent: 'Cultivator') -> bool:
        """判断是否会选择战斗"""
        win_rate = self.calculate_win_rate(opponent)
        defeat_rate = 1 - win_rate
        return self.courage > defeat_rate
    
    def absorb_cultivation(self, defeated_opponent: 'Cultivator'):
        """吸收被击败对手的修为"""
        absorbed = int(defeated_opponent.cultivation_points * self.config.absorption_rate)
        self.cultivation_points += absorbed
        self.defeats_count += 1  # 增加击败计数
        self.battles_count += 1  # 增加战斗计数
    
    def __str__(self):
        return f"修士{self.id}: {self.LEVEL_CONFIGS[self.level].name}期 修为:{self.cultivation_points} 年龄:{self.age} 寿元:{self.get_remaining_lifespan()} 击败:{self.defeats_count}人 战斗:{self.battles_count}次"

class CultivationWorld:
    """修仙世界模拟器"""
    
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.cultivators: List[Cultivator] = []
        self.year = 0
        self.next_id = 1
        self.statistics = {
            'total_cultivators': [],
            'level_distribution': [],
            'battles': [],
            'deaths': [],
            'top_killers': []  # 每年击败人数最多的修士
        }
        
    def set_cultivator_birth_year(self, cultivator: Cultivator):
        """设置修士的出生年份"""
        cultivator.birth_year = max(1, self.year - cultivator.age + 1)  # 确保出生年份至少为第1年
    
    def add_new_cultivators(self, count: int = None):
        """每年新增筑基成功的修士"""
        if count is None:
            count = self.config.new_cultivators_per_year
            
        for _ in range(count):
            cultivator = Cultivator(self.next_id, self.config)
            cultivator.cultivation_points = 10  # 筑基期起始修为
            cultivator.level = CultivationLevel.ZHUJI
            # 筑基成功年龄 = 开始修炼年龄 + 10年
            cultivator.age = cultivator.age + 10
            self.set_cultivator_birth_year(cultivator)  # 设置出生年份
            self.cultivators.append(cultivator)
            self.next_id += 1
    
    def get_cultivators_by_level(self, level: CultivationLevel) -> List[Cultivator]:
        """获取指定等级的修士"""
        return [c for c in self.cultivators if c.is_alive and c.level == level]
    
    def simulate_encounters(self):
        """模拟修士相遇和战斗"""
        battles_this_year = 0
        deaths_this_year = 0
        
        # 只考虑筑基及以上的修士
        active_cultivators = [c for c in self.cultivators if c.is_alive and c.level.value >= 1]
        total_count = len(active_cultivators)
        
        if total_count == 0:
            return battles_this_year, deaths_this_year
        
        # 按等级分组
        level_groups = {}
        for level in CultivationLevel:
            if level.value >= 1:  # 筑基及以上
                level_groups[level] = self.get_cultivators_by_level(level)
        
        # 模拟每个等级内的相遇
        for level, cultivators_in_level in level_groups.items():
            if len(cultivators_in_level) < 2:
                continue
            
            level_count = len(cultivators_in_level)
            encounter_probability = level_count / total_count
            
            # 每个修士都有概率遇到同级修士
            for cultivator in cultivators_in_level[:]:
                if not cultivator.is_alive:
                    continue
                
                if random.random() < encounter_probability:
                    # 随机选择一个同级对手
                    possible_opponents = [c for c in cultivators_in_level if c.is_alive and c.id != cultivator.id]
                    if possible_opponents:
                        opponent = random.choice(possible_opponents)
                        
                        # 判断是否发生战斗
                        cultivator_fights = cultivator.will_fight(opponent)
                        opponent_fights = opponent.will_fight(cultivator)
                        
                        if cultivator_fights or opponent_fights:
                            battles_this_year += 1
                            
                            # 计算战斗结果
                            win_rate = cultivator.calculate_win_rate(opponent)
                            if random.random() < win_rate:
                                # cultivator胜利
                                cultivator.absorb_cultivation(opponent)
                                opponent.battles_count += 1  # 败者也增加战斗计数
                                opponent.is_alive = False
                                deaths_this_year += 1
                            else:
                                # opponent胜利
                                opponent.absorb_cultivation(cultivator)
                                cultivator.battles_count += 1  # 败者也增加战斗计数
                                cultivator.is_alive = False
                                deaths_this_year += 1
        
        return battles_this_year, deaths_this_year
    
    def simulate_year(self):
        """模拟一年"""
        self.year += 1
        
        # 所有修士修炼
        for cultivator in self.cultivators:
            cultivator.cultivate_yearly()
        
        # 新增筑基修士
        self.add_new_cultivators()
        
        # 模拟相遇和战斗
        battles, deaths = self.simulate_encounters()
        
        # 记录统计信息
        alive_cultivators = [c for c in self.cultivators if c.is_alive]
        self.statistics['total_cultivators'].append(len(alive_cultivators))
        self.statistics['battles'].append(battles)
        self.statistics['deaths'].append(deaths)
        
        # 记录等级分布
        level_dist = {}
        for level in CultivationLevel:
            count = len([c for c in alive_cultivators if c.level == level])
            level_dist[level.name] = count
        self.statistics['level_distribution'].append(level_dist)
        
        # 记录击败数最多的修士
        if alive_cultivators:
            top_killer = max(alive_cultivators, key=lambda x: x.defeats_count)
            self.statistics['top_killers'].append({
                'year': self.year,
                'cultivator_id': top_killer.id,
                'defeats': top_killer.defeats_count,
                'level': top_killer.level.name,
                'cultivation': top_killer.cultivation_points
            })
        else:
            self.statistics['top_killers'].append(None)
    
    def get_status_report(self) -> str:
        """获取当前状态报告"""
        alive_cultivators = [c for c in self.cultivators if c.is_alive]
        
        report = f"\n=== 第{self.year}年修仙界状况 ===\n"
        report += f"总修士数量: {len(alive_cultivators)}\n"
        
        # 等级分布
        for level in CultivationLevel:
            count = len([c for c in alive_cultivators if c.level == level])
            if count > 0:
                level_name = Cultivator.LEVEL_CONFIGS[level].name
                report += f"{level_name}期修士: {count}人\n"
        
        # 各等级统计信息
        report += "\n=== 各等级统计 ===\n"
        for level in CultivationLevel:
            level_cultivators = [c for c in alive_cultivators if c.level == level]
            if level_cultivators:
                avg_courage = sum(c.courage for c in level_cultivators) / len(level_cultivators)
                avg_battles = sum(c.battles_count for c in level_cultivators) / len(level_cultivators)
                avg_lifespan = sum(c.get_remaining_lifespan() for c in level_cultivators) / len(level_cultivators)
                level_name = Cultivator.LEVEL_CONFIGS[level].name
                report += f"{level_name}期({len(level_cultivators)}人): 平均勇气{avg_courage:.3f} 平均战斗{avg_battles:.1f}次 平均寿元{avg_lifespan:.1f}年\n"
        
        # 最强修士详细信息
        if alive_cultivators:
            strongest = max(alive_cultivators, key=lambda x: x.cultivation_points)
            report += f"\n=== 最强修士详情 ===\n"
            report += f"修士{strongest.id}: {Cultivator.LEVEL_CONFIGS[strongest.level].name}期\n"
            report += f"修为: {strongest.cultivation_points}点\n"
            birth_year_display = f"第{strongest.birth_year}年" if strongest.birth_year > 0 else "模拟开始前"
            report += f"出生年份: {birth_year_display}\n"
            report += f"击败敌人: {strongest.defeats_count}人\n"
            report += f"勇气值: {strongest.courage:.3f}\n"
            report += f"年龄: {strongest.age}岁, 剩余寿元: {strongest.get_remaining_lifespan()}年\n"
            
            # 击败人数最多的修士
            top_killer = max(alive_cultivators, key=lambda x: x.defeats_count)
            if top_killer.defeats_count > 0 and top_killer.id != strongest.id:
                report += f"\n=== 杀戮之王 ===\n"
                report += f"修士{top_killer.id}: {Cultivator.LEVEL_CONFIGS[top_killer.level].name}期\n"
                report += f"击败敌人: {top_killer.defeats_count}人\n"
                report += f"勇气值: {top_killer.courage:.3f}\n"
        
        return report
    
    def plot_statistics(self):
        """生成统计图表"""
        if not self.statistics['total_cultivators']:
            print("没有统计数据可供绘制")
            return
            
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('修仙世界统计报告', fontsize=16, fontweight='bold')
        
        years = list(range(len(self.statistics['total_cultivators'])))
        
        # 数据采样优化：当数据点过多时进行采样
        def sample_data(data_list, max_points=100):
            """对数据进行采样，避免图表过于密集"""
            if len(data_list) <= max_points:
                return list(range(len(data_list))), data_list
            
            # 计算采样间隔
            step = len(data_list) // max_points
            if step < 1:
                step = 1
            
            # 采样索引和数据
            sampled_indices = list(range(0, len(data_list), step))
            # 确保包含最后一个数据点
            if sampled_indices[-1] != len(data_list) - 1:
                sampled_indices.append(len(data_list) - 1)
            
            sampled_data = [data_list[i] for i in sampled_indices]
            return sampled_indices, sampled_data
        
        # 1. 不同年份的修士总数（采样优化）
        sampled_years, sampled_cultivators = sample_data(self.statistics['total_cultivators'])
        ax1.plot(sampled_years, sampled_cultivators, 'b-', linewidth=2, marker='o', markersize=4)
        ax1.set_title(f'历年修士总数变化 (显示{len(sampled_years)}/{len(years)}个数据点)')
        ax1.set_xlabel('年份')
        ax1.set_ylabel('修士数量')
        ax1.grid(True, alpha=0.3)
        
        # 2. 每年发生战斗的次数（采样优化）
        sampled_years_battles, sampled_battles = sample_data(self.statistics['battles'])
        ax2.plot(sampled_years_battles, sampled_battles, 'r-', linewidth=2, marker='s', markersize=4)
        ax2.set_title(f'每年战斗次数 (显示{len(sampled_years_battles)}/{len(years)}个数据点)')
        ax2.set_xlabel('年份')
        ax2.set_ylabel('战斗次数')
        ax2.grid(True, alpha=0.3)
        
        # 3. 结束时期不同阶段的修士人数对比
        alive_cultivators = [c for c in self.cultivators if c.is_alive]
        if alive_cultivators:
            level_counts = {}
            
            for cultivator in alive_cultivators:
                level_name = Cultivator.LEVEL_CONFIGS[cultivator.level].name + "期"
                level_counts[level_name] = level_counts.get(level_name, 0) + 1
            
            # 按等级从低到高排序
            level_order = []
            counts = []
            for level_enum in CultivationLevel:
                level_name = Cultivator.LEVEL_CONFIGS[level_enum].name + "期"
                if level_name in level_counts:
                    level_order.append(level_name)
                    counts.append(level_counts[level_name])
            
            if level_order:  # 确保有数据才绘制
                ax3.bar(level_order, counts, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][:len(level_order)])
                ax3.set_title('结束时期各阶段修士人数对比')
                ax3.set_xlabel('修炼阶段')
                ax3.set_ylabel('修士人数')
                ax3.tick_params(axis='x', rotation=45)
                
                # 在柱状图上显示数值
                for i, count in enumerate(counts):
                    ax3.text(i, count + max(counts) * 0.01, str(count), ha='center', va='bottom')
        
        # 4. 结束时期不同阶段的修士勇气平均值对比
        if alive_cultivators:
            level_courage = {}
            
            for cultivator in alive_cultivators:
                level_name = Cultivator.LEVEL_CONFIGS[cultivator.level].name + "期"
                if level_name not in level_courage:
                    level_courage[level_name] = []
                level_courage[level_name].append(cultivator.courage)
            
            # 按等级从低到高排序
            level_order = []
            avg_courages = []
            for level_enum in CultivationLevel:
                level_name = Cultivator.LEVEL_CONFIGS[level_enum].name + "期"
                if level_name in level_courage:
                    level_order.append(level_name)
                    avg_courages.append(sum(level_courage[level_name]) / len(level_courage[level_name]))
            
            if level_order:  # 确保有数据才绘制
                ax4.bar(level_order, avg_courages, color=['#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'][:len(level_order)])
                ax4.set_title('结束时期各阶段修士平均勇气值对比')
                ax4.set_xlabel('修炼阶段')
                ax4.set_ylabel('平均勇气值')
                ax4.tick_params(axis='x', rotation=45)
                
                # 在柱状图上显示数值
                for i, courage in enumerate(avg_courages):
                    ax4.text(i, courage + max(avg_courages) * 0.01, f'{courage:.3f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.show()

def run_demo(config: SimulationConfig):
    """运行演示模式"""
    print("=== 修仙世界模拟器演示 ===")
    print(f"配置参数:")
    print(f"- 模拟时长: {config.simulation_years}年")
    print(f"- 修为吸取比率: {config.absorption_rate*100:.1f}%")
    print(f"- 开始修炼年龄: 6-10岁正态分布（均值8岁）")
    print(f"- 每年新增修士: {config.new_cultivators_per_year}人\n")
    
    # 分析修炼机制
    print("=== 修炼机制分析 ===")
    
    # 创建几个测试修士
    test_config = SimulationConfig()
    cultivator1 = Cultivator(1, test_config)
    cultivator1.cultivation_points = 50
    cultivator1.level = CultivationLevel.ZHUJI
    cultivator1.courage = 0.8  # 高勇气
    
    cultivator2 = Cultivator(2, test_config)
    cultivator2.cultivation_points = 60
    cultivator2.level = CultivationLevel.ZHUJI
    cultivator2.courage = 0.3  # 低勇气
    
    print(f"修士1: 修为{cultivator1.cultivation_points}, 勇气{cultivator1.courage:.2f}, 击败{cultivator1.defeats_count}人")
    print(f"修士2: 修为{cultivator2.cultivation_points}, 勇气{cultivator2.courage:.2f}, 击败{cultivator2.defeats_count}人")
    
    # 计算战斗概率
    win_rate_1 = cultivator1.calculate_win_rate(cultivator2)
    win_rate_2 = cultivator2.calculate_win_rate(cultivator1)
    
    print(f"\n如果相遇:")
    print(f"修士1胜率: {win_rate_1:.2f}, 败率: {1-win_rate_1:.2f}")
    print(f"修士2胜率: {win_rate_2:.2f}, 败率: {1-win_rate_2:.2f}")
    
    # 判断是否会战斗
    will_fight_1 = cultivator1.will_fight(cultivator2)
    will_fight_2 = cultivator2.will_fight(cultivator1)
    
    print(f"\n战斗意愿:")
    print(f"修士1会战斗: {will_fight_1} (勇气{cultivator1.courage:.2f} > 败率{1-win_rate_1:.2f})")
    print(f"修士2会战斗: {will_fight_2} (勇气{cultivator2.courage:.2f} > 败率{1-win_rate_2:.2f})")
    
    if will_fight_1 or will_fight_2:
        print("\n结果: 将发生战斗!")
        print(f"胜利者将吸收败者{config.absorption_rate*100:.1f}%的修为，并增加1次击败记录")
    else:
        print("\n结果: 双方都会退缩，无事发生")
    
    # 显示等级要求
    print("\n=== 修炼等级要求 ===")
    for level in CultivationLevel:
        level_config = Cultivator.LEVEL_CONFIGS[level]
        print(f"{level_config.name}期: 需要{level_config.required_cultivation}点修为, "
              f"基础寿元{level_config.base_lifespan}年, 晋升奖励{level_config.lifespan_bonus}年")
    
    print("\n关键问题分析:")
    print("- 修士开始修炼年龄为6-10岁（正态分布）")
    print("- 筑基期修士寿元有限，必须通过战斗获得额外修为才能晋升")
    print("- 每次战斗胜利都会记录击败人数，形成杀戮排行榜")
    print("- 这解释了为什么修仙界充满杀戮和竞争")

def run_simulation(config: SimulationConfig, show_progress: bool = True):
    """运行完整模拟"""
    print(f"\n=== 开始{config.simulation_years}年修仙世界模拟 ===")
    
    world = CultivationWorld(config)
    
    # 初始化：添加第一批筑基修士
    world.add_new_cultivators()
    
    # 为初始修士设置正确的出生年份
    for cultivator in world.cultivators:
        world.set_cultivator_birth_year(cultivator)
    
    # 模拟指定年数
    report_interval = max(1, config.simulation_years // 10)  # 每10%进度输出一次
    
    for year in range(config.simulation_years):
        world.simulate_year()
        
        # 定期输出状态
        if show_progress and (year + 1) % report_interval == 0:
            print(world.get_status_report())
    
    # 显示最终统计
    print("\n=== 模拟结束 ===")
    print(world.get_status_report())
    
    # 绘制统计图表
    print("\n正在生成统计图表...")
    world.plot_statistics()
    
    return world

def main():
    """主程序"""
    parser = argparse.ArgumentParser(description='修仙世界模拟器')
    parser.add_argument('--years', type=int, default=100, help='模拟时长（年），默认100年')
    parser.add_argument('--absorption-rate', type=float, default=0.1, help='修为吸取比率，默认0.1（10%）')
    parser.add_argument('--demo', action='store_true', help='运行演示模式')
    parser.add_argument('--no-progress', action='store_true', help='不显示进度报告')
    
    args = parser.parse_args()
    
    # 验证参数
    if args.years <= 0:
        print("错误：模拟时长必须大于0")
        return
    
    if not 0 < args.absorption_rate <= 1:
        print("错误：修为吸取比率必须在0-1之间")
        return
    
    # 创建配置
    config = SimulationConfig(args.years, args.absorption_rate)
    
    print("修仙世界模拟器启动...")
    print(f"模拟参数: {args.years}年, 吸取比率{args.absorption_rate*100:.1f}%")
    
    if args.demo:
        # 运行演示模式
        run_demo(config)
        
        # 运行模拟（使用用户指定的年数）
        run_simulation(config, not args.no_progress)
    else:
        # 运行完整模拟
        run_simulation(config, not args.no_progress)

if __name__ == "__main__":
    main()