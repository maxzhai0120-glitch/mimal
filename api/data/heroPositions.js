// 英雄位置映射表
// primary: 主位置 (1-5)
// flexible: 可摇摆位置数组
// 基于当前版本主流打法整理

export const HERO_POSITIONS = {
  // 1号位核心 (Safe Lane Carry)
  1: { primary: 1, name: '敌法师' },
  6: { primary: 1, name: '卓尔游侠' },
  12: { primary: 1, name: '幻影长矛手' },
  41: { primary: 1, name: '虚空假面' },
  42: { primary: 1, name: '冥魂大帝' },
  48: { primary: 1, name: '露娜' },
  54: { primary: 1, name: '噬魂鬼' },
  56: { primary: 1, name: '克林克兹' },
  63: { primary: 1, name: '编织者' },
  67: { primary: 1, name: '幽鬼' },
  80: { primary: 1, name: '德鲁伊' },
  81: { primary: 1, name: '混沌骑士' },
  89: { primary: 1, name: '娜迦海妖' },
  94: { primary: 1, name: '美杜莎' },
  95: { primary: 1, name: '巨魔战将' },
  109: { primary: 1, name: '恐怖利刃' },
  114: { primary: 1, name: '齐天大圣' },
  129: { primary: 1, name: '琼英碧灵' },

  // 2号位中单 (Mid Lane)
  11: { primary: 2, name: '影魔' },
  13: { primary: 2, name: '帕克' },
  17: { primary: 2, name: '风暴之灵' },
  18: { primary: 2, name: '斯温', flexible: [1] },
  22: { primary: 2, name: '宙斯', flexible: [4, 5] },
  25: { primary: 2, name: '莉娜', flexible: [4, 5] },
  34: { primary: 2, name: '修补匠' },
  35: { primary: 2, name: '狙击手', flexible: [1] },
  38: { primary: 2, name: '兽王', flexible: [3] },
  39: { primary: 2, name: '痛苦女王', flexible: [4] },
  43: { primary: 2, name: '死亡先知', flexible: [3] },
  46: { primary: 2, name: '圣堂刺客' },
  47: { primary: 2, name: '冥界亚龙', flexible: [3] },
  49: { primary: 2, name: '龙骑士', flexible: [3] },
  52: { primary: 2, name: '拉席克', flexible: [3] },
  62: { primary: 2, name: '赏金猎人', flexible: [4] },
  72: { primary: 2, name: '矮人直升机', flexible: [1] },
  73: { primary: 2, name: '炼金术士', flexible: [1] },
  74: { primary: 2, name: '祈求者' },
  76: { primary: 2, name: '殁境神蚀者', flexible: [3] },
  106: { primary: 2, name: '灰烬之灵' },
  107: { primary: 2, name: '大地之灵', flexible: [4] },
  123: { primary: 2, name: '虚无之灵' },

  // 3号位劣势路 (Offlane)
  2: { primary: 3, name: '斧王' },
  16: { primary: 3, name: '沙王', flexible: [4] },
  19: { primary: 3, name: '小小', flexible: [4] },
  23: { primary: 3, name: '昆卡', flexible: [2] },
  28: { primary: 3, name: '斯拉达', flexible: [4] },
  29: { primary: 3, name: '潮汐猎人' },
  37: { primary: 3, name: '术士', flexible: [5] },
  50: { primary: 3, name: '戴泽', flexible: [4, 5] },
  55: { primary: 3, name: '黑暗贤者', flexible: [4] },
  59: { primary: 3, name: '哈斯卡', flexible: [2] },
  60: { primary: 3, name: '暗夜魔王' },
  65: { primary: 3, name: '蝙蝠骑士', flexible: [2] },
  69: { primary: 3, name: '末日使者' },
  70: { primary: 3, name: '熊战士', flexible: [1] },
  77: { primary: 3, name: '狼人', flexible: [1] },
  78: { primary: 3, name: '酒仙', flexible: [4] },
  83: { primary: 3, name: '树精卫士', flexible: [4, 5] },
  85: { primary: 3, name: '不朽尸王', flexible: [4, 5] },
  88: { primary: 3, name: '司夜刺客', flexible: [4] },
  96: { primary: 3, name: '半人马战行者' },
  97: { primary: 3, name: '马格纳斯', flexible: [4] },
  98: { primary: 3, name: '伐木机' },
  99: { primary: 3, name: '钢背兽' },
  100: { primary: 3, name: '巨牙海民', flexible: [4, 5] },
  102: { primary: 3, name: '亚巴顿', flexible: [4, 5] },
  103: { primary: 3, name: '上古巨神', flexible: [4, 5] },
  104: { primary: 3, name: '军团指挥官', flexible: [4] },
  108: { primary: 3, name: '孽主' },
  110: { primary: 3, name: '凤凰', flexible: [4, 5] },
  116: { primary: 3, name: '石鳞剑士' },
  118: { primary: 3, name: '玛尔斯' },
  120: { primary: 3, name: '电炎绝手', flexible: [4, 5] },
  122: { primary: 3, name: '破晓晨星', flexible: [4, 5] },
  126: { primary: 3, name: '百戏大王', flexible: [4] },
  128: { primary: 3, name: '獸' },

  // 4号位辅助 (Soft Support / Roamer)
  4: { primary: 4, name: '嗜血狂魔', flexible: [2, 3] },
  7: { primary: 4, name: '撼地者', flexible: [5] },
  8: { primary: 4, name: '主宰', flexible: [1] },
  9: { primary: 4, name: '米拉娜', flexible: [1, 5] },
  14: { primary: 4, name: '帕吉', flexible: [3] },
  20: { primary: 4, name: '复仇之魂', flexible: [5] },
  21: { primary: 4, name: '风行者', flexible: [2, 3] },
  26: { primary: 4, name: '莱恩', flexible: [5] },
  27: { primary: 4, name: '暗影萨满', flexible: [5] },
  30: { primary: 4, name: '巫医', flexible: [5] },
  31: { primary: 4, name: '巫妖', flexible: [5] },
  32: { primary: 4, name: '力丸' },
  33: { primary: 4, name: '谜团', flexible: [3] },
  40: { primary: 4, name: '剧毒术士', flexible: [3, 5] },
  44: { primary: 4, name: '幻影刺客', flexible: [1] },
  51: { primary: 4, name: '发条技师' },
  53: { primary: 4, name: '先知', flexible: [1, 2, 3] },
  57: { primary: 4, name: '全能骑士', flexible: [5] },
  58: { primary: 4, name: '魅惑魔女', flexible: [1, 5] },
  61: { primary: 4, name: '育母蜘蛛', flexible: [1, 2] },
  64: { primary: 4, name: '杰奇洛', flexible: [5] },
  66: { primary: 4, name: '陈', flexible: [5] },
  68: { primary: 4, name: '远古冰魄', flexible: [5] },
  71: { primary: 4, name: '裂魂人', flexible: [3] },
  79: { primary: 4, name: '暗影恶魔', flexible: [5] },
  84: { primary: 4, name: '食人魔魔法师', flexible: [5] },
  86: { primary: 4, name: '拉比克', flexible: [5] },
  87: { primary: 4, name: '干扰者', flexible: [5] },
  90: { primary: 4, name: '光之守卫', flexible: [5] },
  91: { primary: 4, name: '艾欧', flexible: [5] },
  92: { primary: 4, name: '维萨吉', flexible: [2, 3] },
  93: { primary: 4, name: '斯拉克', flexible: [1] },
  101: { primary: 4, name: '天怒法师', flexible: [5] },
  105: { primary: 4, name: '工程师' },
  111: { primary: 4, name: '神谕者', flexible: [5] },
  113: { primary: 4, name: '天穹守望者', flexible: [2] },
  115: { primary: 4, name: '邪影芳灵', flexible: [5] },
  117: { primary: 4, name: '天涯墨客', flexible: [5] },
  121: { primary: 4, name: '森海飞霞', flexible: [2] },
  124: { primary: 4, name: '玛西', flexible: [3] },
  127: { primary: 4, name: '无面之王', flexible: [3] },

  // 5号位辅助 (Hard Support)
  // 大部分4号位英雄也可以打5，以下主要是纯5号位或主5的英雄
  3: { primary: 5, name: '祸乱之源', flexible: [4] },
  5: { primary: 5, name: '水晶室女', flexible: [4] },
  10: { primary: 5, name: '变体精灵', flexible: [1, 2] },
  15: { primary: 5, name: '剃刀', flexible: [2, 3] },
  24: { primary: 5, name: '昆卡', flexible: [2, 3] }, // duplicate with 23, keep consistent
  36: { primary: 5, name: '瘟疫法师', flexible: [2, 3] },
  45: { primary: 5, name: '帕格纳', flexible: [4] },
  75: { primary: 5, name: '沉默术士', flexible: [4] },
  119: { primary: 5, name: '虚无之灵', flexible: [2] }, // duplicate with 123
};

export function getHeroPosition(heroId) {
  return HERO_POSITIONS[heroId] || null;
}

export function inferPosition(heroId, { gpm = 0, obsPlaced = 0, senPlaced = 0, teamPlayers = [], playerRole = null, playerRaw = null } = {}) {
  const hero = getHeroPosition(heroId);
  if (!hero) return { position: null, confidence: 'low', reason: '未知英雄' };

  let position = hero.primary;
  const flexible = hero.flexible || [];

  // === 前10分钟数据提取 ===
  const earlyKills = (playerRaw?.kills_log || []).filter((k) => k.time < 600).length;
  const earlyDeaths = (playerRaw?.death_log || []).filter((d) => d.time < 600).length;
  const earlySoloDeaths = (playerRaw?.death_log || []).filter((d) => d.time < 600).length;
  // 单杀判断：前10分钟死亡且该次击杀无助攻信息（OpenDota无助攻日志，用death_log近似）
  // 注：用户提到"前10分钟被单杀=2号位"，作为辅助判断

  // === Step 1: 根据 playerRole 限制推断范围 ===
  if (playerRole === 'core') {
    // 只考虑1/2/3号位
    if (position >= 4) {
      // 英雄主位置是辅助但用户选核心，按经济数据在1/2/3中找最合适的
      if (flexible.includes(1) && gpm >= 500) position = 1;
      else if (flexible.includes(2) && gpm >= 450) position = 2;
      else if (flexible.includes(3) && gpm >= 400) position = 3;
      else {
        // fallback：按GPM在1/2/3中分配
        if (gpm >= 500) position = 1;
        else if (gpm >= 420) position = 2;
        else position = 3;
      }
    } else {
      // 英雄主位置已经是核心，正常摇摆判断
      if (flexible.includes(1) && gpm >= 500) position = 1;
      else if (flexible.includes(2) && gpm >= 450) position = 2;
      else if (flexible.includes(3) && gpm >= 400 && obsPlaced < 5) position = 3;
    }

    // 辅助判断：前10分钟多次单杀死亡（无助攻）→ 可能是2号位被单杀
    // 但这里不做硬性覆盖，只记录到 reason 中
  }

  if (playerRole === 'support') {
    // 只考虑4/5号位
    if (position <= 3) {
      // 英雄主位置是核心但用户选辅助，强行归类到4/5
      position = flexible.includes(4) ? 4 : (flexible.includes(5) ? 5 : 4);
    }

    // 4/5号位区分逻辑
    if (teamPlayers.length === 5) {
      const sortedByGpm = [...teamPlayers].sort((a, b) => (b.gold_per_min || 0) - (a.gold_per_min || 0));
      const rank = sortedByGpm.findIndex((p) => p.hero_id === heroId) + 1;
      const totalSupportItems = (obsPlaced || 0) + (senPlaced || 0);

      // 主判断：队内经济排名
      if (rank >= 5 && totalSupportItems >= 6) {
        position = 5;
      } else if (rank === 4) {
        position = 4;
      } else if (rank >= 5) {
        position = hero.primary >= 4 ? hero.primary : 4;
      }

      // 辅助判断1：前10分钟击杀数（gank型4号位通常前期击杀多）
      if (earlyKills >= 2) {
        position = 4; // 前期有击杀 → 偏gank的4号位
      }

      // 辅助判断2：前10分钟死亡数（保线型5号位对线期更容易死）
      if (earlyDeaths >= 3) {
        // 死亡多不一定就是5，但可辅助判断
        // 不覆盖，只影响 confidence
      }
    }
  }

  // playerRole 未指定时的默认逻辑（向后兼容）
  if (!playerRole) {
    if (position <= 3) {
      if (flexible.includes(1) && gpm >= 500) position = 1;
      else if (flexible.includes(2) && gpm >= 450) position = 2;
      else if (flexible.includes(3) && gpm >= 400 && obsPlaced < 5) position = 3;
    }

    const isSupportHero = position >= 4 || flexible.includes(4) || flexible.includes(5);
    if (isSupportHero && teamPlayers.length === 5) {
      const sortedByGpm = [...teamPlayers].sort((a, b) => (b.gold_per_min || 0) - (a.gold_per_min || 0));
      const rank = sortedByGpm.findIndex((p) => p.hero_id === heroId) + 1;
      const totalSupportItems = (obsPlaced || 0) + (senPlaced || 0);

      if (rank >= 5 && totalSupportItems >= 6) position = 5;
      else if (rank === 4) position = 4;
      else if (rank >= 5) position = hero.primary >= 4 ? hero.primary : 4;
    }
  }

  const isSupport = position >= 4;
  const isDefault = position === hero.primary;

  return {
    position,
    confidence: isSupport ? 'medium' : (isDefault ? 'high' : 'medium'),
    reason: isSupport
      ? `队内经济排名辅助判断，${isDefault ? '按英雄主位置' : '经济数据偏离'}推断为${position}号位`
      : (isDefault ? `按${hero.name}主位置推断` : `经济数据偏离主位置，可能为${position}号位`),
    flexible,
  };
}

export const POSITION_NAMES = {
  1: '1号位核心',
  2: '2号位中单',
  3: '3号位劣势路',
  4: '4号位辅助',
  5: '5号位辅助',
};
