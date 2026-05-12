# OpenDota Match 8804140289 数据字段清单

> 基于 OpenDota `/matches/{match_id}` 接口返回的原始 JSON 整理。

---

## 一、比赛基本信息（Top Level）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `match_id` | number | 对局 ID | 标识 |
| `duration` | number | 比赛时长（秒） | 计算分钟数、判断局型 |
| `radiant_win` | bool | 天辉是否获胜 | 胜负结果 |
| `start_time` | number | 比赛开始时间戳 | 时间定位 |
| `lobby_type` | number | 房间类型（7=天梯，0=普通匹配） | 模式校验 |
| `game_mode` | number | 游戏模式 | 模式校验 |
| `patch` | number | 版本号 | 版本相关性 |
| `region` | number | 服务器区域 | 地区分析 |
| `replay_url` | string | 录像下载链接 | 视频知识库（预留） |
| `radiant_score` | number | 天辉总击杀 | 局势判断 |
| `dire_score` | number | 夜魇总击杀 | 局势判断 |
| `radiant_gold_adv` | array | 每分钟天辉经济差 | 经济曲线，判断优劣势 |
| `radiant_xp_adv` | array | 每分钟天辉经验差 | 经验曲线，判断等级压制 |
| `picks_bans` | array | 选人/禁人记录 | 阵容分析（B）核心数据 |
| `teamfights` | array | 团战记录 | 局势分析（A）核心数据 |
| `objectives` | array | 目标事件（肉山、塔等） | 转折点识别 |
| `chat` | array | 游戏内聊天 | 情绪/沟通分析（可选） |

---

## 二、玩家基础数据（players[i]）

每个玩家一个对象，共 10 个。

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `player_slot` | number | 玩家位置（0-4 天辉，128-132 夜魇） | 队伍归属 |
| `account_id` | number | Steam 账号 ID | 玩家识别 |
| `personaname` | string | 玩家昵称 | 展示用 |
| `hero_id` | number | 英雄 ID | 英雄识别 |
| `level` | number | 最终等级 | 发育水平 |
| `kills` | number | 击杀数 | KDA |
| `deaths` | number | 死亡数 | KDA |
| `assists` | number | 助攻数 | KDA |
| `kda` | number | KDA 计算值 | 综合表现 |
| `gold` | number | 结束时金钱 | 经济状态 |
| `gold_per_min` | number | GPM（每分钟金钱） | 刷钱效率 |
| `xp_per_min` | number | XPM（每分钟经验） | 升级效率 |
| `last_hits` | number | 正补数 | 发育能力 |
| `denies` | number | 反补数 | 对线压制 |
| `hero_damage` | number | 对英雄伤害 | 输出贡献 |
| `tower_damage` | number | 对建筑伤害 | 推进贡献 |
| `hero_healing` | number | 治疗量 | 辅助贡献 |
| `net_worth` | number | 净资产 | 经济地位 |
| `lane` | number | 分路（1-3） | 对线位置 |
| `lane_role` | number | 分路角色（1-4 对应位置） | 推断位置 |
| `isRadiant` | bool | 是否天辉 | 队伍 |
| `win` | bool | 是否获胜 | 结果 |
| `total_gold` | number | 总获取金钱 | 经济总量 |
| `total_xp` | number | 总获取经验 | 经验总量 |
| `lane_efficiency` | number | 对线效率（0-1） | 对线评价 |
| `lane_efficiency_pct` | number | 对线效率百分比 | 对线评价 |

---

## 三、玩家装备数据（players[i]）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `item_0` ~ `item_5` | number | 6 格装备（物品 ID） | 最终装备 |
| `backpack_0` ~ `backpack_2` | number | 背包物品 | 备用装备 |
| `item_neutral` | number | 中立物品 | 野区资源利用 |
| `purchase_log` | array | 购买记录（时间+物品） | 装备时间线，判断节奏 |
| `purchase` | object | 各物品购买次数汇总 | 消费习惯 |
| `item_uses` | object | 各物品使用次数 | BKB/推推等使用效率 |
| `purchase_time` | object | 各物品首次购买时间 | 关键装备节点 |
| `first_purchase_time` | object | 首件装备时间 | 出装速度 |

---

## 四、玩家伤害/参战数据（players[i]）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `damage` | object | 对各个目标的伤害汇总 | 输出分布 |
| `damage_targets` | object | 对敌方每个英雄的伤害明细 | 针对性输出 |
| `damage_inflictor` | object | 各技能/物品造成的伤害 | 伤害来源分析 |
| `damage_inflictor_received` | object | 受到各技能/物品的伤害 | 承伤分析 |
| `damage_taken` | number | 总承受伤害 | 生存能力 |
| `teamfight_participation` | number | 团战参与率 | 团队性 |
| `actions_per_min` | number | APM | 操作强度 |
| `killed` | object | 击杀各英雄的次数 | 针对性击杀 |
| `killed_by` | object | 被各英雄击杀的次数 | 被克制关系 |

---

## 五、玩家视野/辅助数据（players[i]）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `obs_placed` | number | 侦查守卫（假眼）放置数 | 视野贡献 |
| `sen_placed` | number | 岗哨守卫（真眼）放置数 | 反眼/视野贡献 |
| `obs_log` | array | 每个假眼的放置时间和位置 | 眼位分析 |
| `sen_log` | array | 每个真眼的放置时间和位置 | 眼位分析 |
| `creeps_stacked` | number | 拉野次数 | 资源控制 |
| `camps_stacked` | number | 堆叠野怪次数 | 资源控制 |
| `runes_log` | array | 吃符记录（时间+符文类型） | 资源控制 |
| `roshans_killed` | number | 参与肉山击杀数 | 大型目标 |

---

## 六、玩家日志类时间线数据（players[i]）⭐ 高价值

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `gold_t` | array | 每分钟金钱（时间序列） | 经济曲线 |
| `lh_t` | array | 每分钟正补（时间序列） | 发育曲线 |
| `xp_t` | array | 每分钟经验（时间序列） | 等级曲线 |
| `dn_t` | array | 每分钟反补（时间序列） | 对线曲线 |
| `kills_log` | array | 每次击杀的时间+受害者 | 击杀节奏 |
| `death_log` | array | 每次死亡的时间+凶手 | **死亡分析核心数据** |
| `buyback_log` | array | 买活记录 | 后期决策 |
| `ability_upgrades_arr` | array | 技能加点顺序 | 技能评价 |
| `ability_uses` | object | 各技能使用次数 | 技能释放效率 |

---

## 七、团战数据（teamfights[i]）⭐ 高价值

每场团战一个对象。

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `start` | number | 团战开始时间（秒） | 时间定位 |
| `end` | number | 团战结束时间（秒） | 持续时长 |
| `last_death` | number | 最后死亡时间 | 团战收尾 |
| `deaths` | number | 团战总死亡数 | 惨烈程度 |
| `players` | array | 10 个玩家的团战参与详情 | **核心：谁参与了、伤害、死亡、技能** |

其中 `teamfights[i].players[j]` 包含：
- `deaths`: 该玩家是否死亡
- `buybacks`: 是否买活
- `damage`: 造成伤害
- `healing`: 治疗量
- `gold_delta`: 经济变化
- `xp_delta`: 经验变化
- `ability_uses`: 技能使用
- `item_uses`: 物品使用
- `position`: 死亡/参与时的位置坐标（x, y）

---

## 八、选人/禁人数据（picks_bans[i]）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `is_pick` | bool | 是选人还是禁人 | 区分 PB |
| `hero_id` | number | 英雄 ID | 英雄识别 |
| `team` | number | 队伍（0=天辉，1=夜魇） | 归属 |
| `order` | number | 顺序（1-24） | BP 阶段 |

---

## 九、目标事件（objectives[i]）

| 字段 | 类型 | 中文说明 | 分析价值 |
|---|---|---|---|
| `time` | number | 发生时间（秒） | 时间定位 |
| `type` | string | 事件类型 | 类别 |
| `unit` | string | 涉及单位/英雄 | 主体 |
| `slot` | number | 玩家位置 | 归属 |
| `key` | string | 额外信息 | 详情 |

事件类型包括：`CHAT_MESSAGE_TOWER_KILL`, `CHAT_MESSAGE_BARRACKS_KILL`, `CHAT_MESSAGE_ROSHAN_KILL`, `CHAT_MESSAGE_FIRSTBLOOD`, `CHAT_MESSAGE_AEGIS`, `CHAT_MESSAGE_AEGIS_STOLEN`, `CHAT_MESSAGE_DENIED_AEGIS` 等。

---

## 十、对分析框架最关键的数据字段（按模块）

### A. 局势总览
- `radiant_win`, `duration`, `radiant_score`, `dire_score`
- `radiant_gold_adv`, `radiant_xp_adv`
- `teamfights`（团战时间、结果）
- `objectives`（肉山、塔、一血等关键事件）

### B. 阵容复盘
- `picks_bans`（完整的 BP 顺序）
- `players[i].hero_id`, `players[i].lane`, `players[i].lane_role`

### C. 个人诊断
- 基础：`kills`, `deaths`, `assists`, `kda`, `level`, `gpm`, `xpm`, `last_hits`, `denies`
- 伤害：`hero_damage`, `damage_targets`, `damage_inflictor`
- 参战：`teamfight_participation`, `actions_per_min`
- 装备：`purchase_log`, `purchase_time`, `item_uses`
- 技能：`ability_upgrades_arr`, `ability_uses`
- 时间线：`gold_t`, `lh_t`, `xp_t`, `death_log`, `kills_log`

### D. 数据解读（数据锚点）
- `gold_t`（每分钟经济，可做曲线）
- `lh_t`（每分钟补刀）
- `xp_t`（每分钟经验）
- `death_log`（死亡时间+凶手，可关联装备和事件）
- `purchase_log`（装备购买时间线）
- `obs_log`, `sen_log`（眼位时间线）
