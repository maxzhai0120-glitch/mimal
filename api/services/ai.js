import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getModelConfig } from '../config/models.config.js';
import { getHeroName } from '../data/heroNames.js';

const openaiClients = {};
const anthropicClients = {};

function getOpenAIClient(apiKey) {
  if (!openaiClients[apiKey]) {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    const options = { apiKey };
    if (proxyUrl) {
      options.httpAgent = new HttpsProxyAgent(proxyUrl);
    }
    openaiClients[apiKey] = new OpenAI(options);
  }
  return openaiClients[apiKey];
}

function getAnthropicClient(apiKey) {
  if (!anthropicClients[apiKey]) {
    anthropicClients[apiKey] = new Anthropic({ apiKey });
  }
  return anthropicClients[apiKey];
}

function debugLog(label, data) {
  if (process.env.DEBUG_AI !== 'true') return;
  const timestamp = new Date().toISOString();
  const separator = '\n' + '='.repeat(60);
  console.log(`${separator}\n[${timestamp}] ${label}${separator}\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`);
}

function getPerformanceSummary(matchData, playerSlot) {
  const players = matchData.players || [];
  const target = players.find((p) => p.player_slot === playerSlot);
  if (!target) return '';

  const teammates = players.filter((p) => p.isRadiant === target.isRadiant);
  const rankGpm = teammates.filter((p) => p.gold_per_min > target.gold_per_min).length + 1;
  const rankHeroDmg = teammates.filter((p) => p.hero_damage > target.hero_damage).length + 1;
  const kda = (target.kills + target.assists) / Math.max(1, target.deaths);
  const rankKda = teammates.filter((p) => {
    const pkda = (p.kills + p.assists) / Math.max(1, p.deaths);
    return pkda > kda;
  }).length + 1;

  const isTopGpm = rankGpm === 1;
  const isTopDmg = rankHeroDmg === 1;
  const isTopKda = rankKda === 1;

  let summary = `该玩家在己方队伍的排名：GPM 第 ${rankGpm}/${teammates.length} 名，英雄伤害 第 ${rankHeroDmg}/${teammates.length} 名，KDA 第 ${rankKda}/${teammates.length} 名。`;
  if (isTopGpm && isTopDmg) summary += ' 该玩家是本局经济和伤害双第一，属于团队核心carry表现。';
  else if (isTopKda && (isTopGpm || isTopDmg)) summary += ' 该玩家本局表现非常亮眼，属于团队MVP级别。';
  else if (isTopGpm || isTopDmg || isTopKda) summary += ' 该玩家在某项数据上领跑团队，表现突出。';

  return summary;
}

function getLaningInfo(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  if (!p) return null;

  const isRadiant = p.isRadiant;
  const enemyTeam = matchData.players?.filter((pl) => pl.isRadiant !== isRadiant) || [];
  const teammates = matchData.players?.filter((pl) => pl.isRadiant === isRadiant && pl.player_slot !== playerSlot) || [];

  const laneMap = { 1: '优势路', 2: '中路', 3: '劣势路' };
  const laneRoleMap = { 1: '1号位核心', 2: '2号位中单', 3: '3号位劣势路', 4: '辅助' };

  const sameLaneTeammates = teammates.filter((tm) => tm.lane === p.lane);
  const sameLaneEnemies = enemyTeam.filter((ep) => ep.lane === p.lane);

  return {
    lane: p.lane,
    laneName: laneMap[p.lane] || `lane=${p.lane}`,
    laneRole: p.lane_role,
    laneRoleName: laneRoleMap[p.lane_role] || `lane_role=${p.lane_role}`,
    sameLaneTeammates: sameLaneTeammates.map((tm) => getHeroName(tm.hero_id)),
    sameLaneEnemies: sameLaneEnemies.map((ep) => getHeroName(ep.hero_id)),
  };
}

function getPos3Context(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  if (!p) return '';

  const keyItemNames = {
    blink: '跳刀',
    black_king_bar: 'BKB',
    blade_mail: '刃甲',
    crimson_guard: '赤红甲',
    pipe: '洞察烟斗',
    mekansm: '梅肯斯姆',
    guardian_greaves: '卫士胫甲',
    aghanims_shard: '阿哈利姆魔晶',
    aghanims_scepter: '阿哈利姆神杖',
    force_staff: '原力法杖',
    heavens_halberd: '天堂之戟',
    lotus_orb: '清莲宝珠',
    shivas_guard: '希瓦的守护',
    assault: '强袭胸甲',
    heart: '魔龙之心',
    travel_boots: '远行鞋',
    travel_boots_2: '远行鞋2',
  };

  const purchases = p.purchase_log || [];
  const itemTimings = [];
  for (const [key, name] of Object.entries(keyItemNames)) {
    const purchase = purchases.find((pur) => pur.key === key);
    if (purchase) {
      const minute = Math.floor(purchase.time / 60);
      itemTimings.push(`${name}(${minute}min)`);
    }
  }

  const laningEndMinute = 10;
  const goldTicks = p.gold_t || [];
  const lhTicks = p.lh_t || [];

  const earlyGpm = goldTicks.length > laningEndMinute
    ? Math.floor((goldTicks[laningEndMinute] - goldTicks[0]) / laningEndMinute)
    : null;

  const avgLh = lhTicks.length > laningEndMinute
    ? ((lhTicks[laningEndMinute] - lhTicks[0]) / laningEndMinute).toFixed(1)
    : null;

  const teammates = matchData.players?.filter((pl) => pl.isRadiant === p.isRadiant) || [];
  const rankTowerDmg = teammates.filter((pl) => pl.tower_damage > p.tower_damage).length + 1;

  let context = '';
  if (itemTimings.length) {
    context += `关键装备时间线：${itemTimings.join('、')}。`;
  }
  if (earlyGpm) {
    context += `对线期(前10min)平均GPM约${earlyGpm}。`;
  }
  if (avgLh) {
    context += `对线期平均每分钟正反补${avgLh}个。`;
  }
  context += `对线效率${p.lane_efficiency_pct || '未知'}%。`;
  context += `推塔伤害排名：己方第${rankTowerDmg}/${teammates.length}。`;

  return context;
}

function getPositionGuidance(position) {
  switch (position) {
    case 1:
      return `
【1号位核心分析要求】
- 重点评价：farm效率（GPM曲线、每分钟补刀）、参战时机（刷钱与参团的平衡）、团战切入（死亡log分析）、装备路线与阵容适配度、后期输出转化率（英雄伤害/总经济）
- 关键失误类型：刷钱路线过于危险导致被抓、关键团战不在场或切入过早、出装顺序错误（如先出输出装没保命装面对强切阵容）、幻象/分身使用效率
- 改进方向：farm路线优化、切入时机判断、刷打结合的节奏感`;
    case 2:
      return `
【2号位中单分析要求】
- 重点评价：对线压制力（正反补对比、消耗效率）、控符节奏（2/4/6分钟神符争夺）、游走gank效率（击杀参与率、击杀log时间）、中期带节奏能力（tp支援、推塔参与）、装备选择对局势的放大效果
- 关键失误类型：对线被单杀或血量长期不健康、控符缺失、游走无效（跑图不做事）、中期刷钱不参团导致节奏断档
- 改进方向：对线细节（仇恨、耗蓝）、控符时机判断、游走路线选择、带节奏与发育的平衡`;
    case 3:
      return `
【3号位劣势路分析要求】
- 重点评价：抗压能力（对线期经济曲线、死亡次数）、先手开团质量（控制技能命中率、站位）、团队装贡献（赤红甲/笛子/大鞋等出的时机）、为队友创造的空间（压制对方大哥发育、牵制对面辅助）
- 角色定位：3号位是先手发起者，掌握开团节奏，辅助应配合你的先手时机（如跳刀决斗）。不是"3号位跟辅助节奏"，而是"辅助跟3号位节奏"。
- 数据锚点（你有以下具体数据用于分析）：
  ① 关键装备时间线——跳刀是否在15分钟前、BKB是否在20分钟前、团队装是否在对线期结束后尽快出
  ② 对线期评分——laneEfficiencyPct>70%为优秀，50-70%为正常，<50%为崩了；前10分钟平均GPM和正反补数量
  ③ 推塔贡献排名——反映是否为团队创造了空间
- 关键失误类型：对线崩导致中期没声音、先手脱节（队友跟不上）、团队装出的过晚或选择错误、站位过于保守不敢先手
- 改进方向：抗压对线技巧（拉野、勾兵）、开团时机和站位、团队装优先级判断、如何利用等级优势压制对方`;
    case 4:
      return `
【4号位辅助分析要求】
- 重点评价：游走效率（击杀参与率、控制衔接）、节奏发起（雾的使用、先手成功率）、经济转化能力（关键小件如微光/推推/阿托斯的时机）、团战技能释放（控制链、救人技能使用）
- 关键失误类型：游走无效（跑图不杀人）、控制技能没接上导致击杀失败、经济浪费在小件堆叠上、团战站位靠前被秒
- 改进方向：游走路线和时机（观察敌方大哥位置）、控制技能优先级和衔接、经济使用的性价比（出什么装备最能帮助团队）、团战第二排站位`;
    case 5:
      return `
【5号位辅助分析要求】
- 重点评价：视野控制（眼位质量和覆盖、反眼效率）、保人能力（大哥发育曲线、辅助物品到位时间如大药/吃树/芒果）、团战站位（不被先切、技能能打到关键目标）、技能释放优先级（治疗/控制给对人）
- 关键失误类型：视野缺失导致队友被抓、没保住大哥导致其发育不良、辅助物品不到位（该买粉/眼/雾时没买）、站位靠前被秒
- 改进方向：眼位选择（高台、路口、肉山坑）、保人时的站位和技能使用、团战边缘OB输出技能、辅助物品购买时机`;
    default:
      return '';
  }
}

export async function analyzeMatch({ matchData, playerData, matchSummary, ragDocs, modelId }) {
  const config = getModelConfig(modelId);
  const apiKey = process.env[config.apiKeyEnv];

  const ragContext = ragDocs.length
    ? '以下是几篇与当前对局最相关的高手复盘参考：\n\n' +
      ragDocs.map((doc, i) => `--- 参考 ${i + 1} ---\n${doc.body}`).join('\n\n') +
      '\n\n请结合以上参考思路，'
    : '（本次分析未检索到相关知识库内容，将完全基于对局数据进行分析。）\n\n';

  const radiantHeroes = matchData.players?.filter((p) => p.isRadiant).map((p) => getHeroName(p.hero_id)) || [];
  const direHeroes = matchData.players?.filter((p) => !p.isRadiant).map((p) => getHeroName(p.hero_id)) || [];
  const targetHero = getHeroName(playerData.hero);

  const position = playerData.inferredPosition || 0;
  const positionGuidance = getPositionGuidance(position);

  const performanceSummary = getPerformanceSummary(matchData, playerData.slot);

  const laningInfo = getLaningInfo(matchData, playerData.slot);
  const laningContext = laningInfo
    ? `\n对线信息：玩家在${laningInfo.laneName}（${laningInfo.laneRoleName}），同路队友：${laningInfo.sameLaneTeammates.join('、') || '无'}，对线敌方英雄：${laningInfo.sameLaneEnemies.join('、') || '数据不足以判断'}。`
    : '';

  const pos3Context = position === 3 ? getPos3Context(matchData, playerData.slot) : '';

  // 构建数据可用性说明
  const hasMinuteData = playerData.lhTicks && playerData.lhTicks.length > 0;
  const dataAvailability = hasMinuteData
    ? ''
    : '\n\n【数据可用性说明】该对局未被OpenDota解析，缺少laneEfficiencyPct、lhTicks、dnTicks等分钟级数据。分析对线表现时，请基于总补刀数(lastHits)和游戏时长做粗略估算，或直接说明"数据不足以判断对线细节"。不要臆测。';

  const systemPrompt = `你是一位 8000 分以上的 DOTA2 分析师，擅长通过数据复盘对局。你的风格直接、具体、有见地。遵守以下原则：
1. 玩家表现优秀时，大方给予肯定和赞赏，加入情绪价值。不要吝啬夸奖。
2. 不要给"正确的废话"（如"你必须注意走位"这种适用于任何局的泛泛之谈）。
3. 只在玩家表现确有不足的维度给出建议；表现好的维度只描述事实、分析为什么好、给予肯定，不要画蛇添足给建议。
4. 如果你无法从数据中推断出某个结论（如对线优劣），明确说明"数据不足以判断"，不要臆测。
5. 输出必须严格按 JSON 格式。`;

  const userPrompt = `${ragContext}分析以下对局数据：\n\n对局摘要：${JSON.stringify(matchSummary, null, 2)}\n\n玩家详细数据：${JSON.stringify(playerData, null, 2)}\n\n玩家本局相对表现：${performanceSummary}${laningContext}${pos3Context ? '\n\n' + pos3Context : ''}${dataAvailability}\n\n阵容信息：\n天辉：${radiantHeroes.join('、')}\n夜魇：${direHeroes.join('、')}\n分析目标英雄：${targetHero}\n推断位置：${playerData.inferredPositionName || '未知'}（置信度：${playerData.positionConfidence || 'low'}）${positionGuidance}\n\n【输出要求】\n请按以下 JSON 格式返回分析结果：\n{\n  "overview": "局势总评。必须覆盖：①本局胜负原因和最关键转折点（从团队经济和经验变化判断）；②是否有队友表现亮眼/滚起雪球；③玩家本人的整体表现评价（MVP级开头就要明确赞赏）。200字左右。",\n  "draftAnalysis": "阵容分析（纯基于阵容，不是基于玩家实际数据）。必须覆盖以下4点，但写成一段连贯的文字，不要分小标题：①双方阵容整体优劣；②玩家对线好不好打（参考已提供的对线信息）；③中期哪边更强；④后期哪边赢面更大。",\n  "earlyGame": "前期分析（对线期+初期小规模团战）。重要规则：如果laneEfficiencyPct为空或缺失，直接说'该对局未被OpenDota解析，缺少分钟级数据，无法判断对线细节'，然后基于总补刀数(lastHits)和游戏时长做粗略估算即可。如果数据存在，利用laneEfficiencyPct（>70%优秀，50-70%正常，<50%崩了）、lhTicks、dnTicks判断。分析：①对线表现；②前期有没有在强势期发挥作用；③如果没有，是被什么阻碍了。",\n  "midGame": "中期分析。分析：①中期局势如何（优势/劣势/僵持）；②玩家有没有在应该发力的中期发挥作用；③关键团战或节奏点的得失；④导致局势变化的关键节点。",\n  "lateGame": "后期分析（如适用）。分析：①后期局势和胜负关键；②玩家有没有在后期发挥作用；③如果没有，原因是什么。",\n  "itemAndSkill": "装备与技能选择。分析：①关键装备（尤其是跳刀、BKB、团队装）的购买时机是否合理；②出装思路是否符合当前局势；③技能加点是否合理；④如果有问题，给出替代方案。",\n  "improvements": ["可操作建议。只写本局确有不足的方面，融入前中后期的具体分析中。表现优秀可以只有1条甚至为空。"]\n}`;

  debugLog('ANALYZE SYSTEM PROMPT', systemPrompt);
  debugLog('ANALYZE USER PROMPT', userPrompt);

  if (config.provider === 'openai') {
    const client = getOpenAIClient(apiKey);
    const isNewGen = config.model.startsWith('gpt-5') || config.model.startsWith('o');
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...(isNewGen
        ? { max_completion_tokens: config.maxTokens }
        : { max_tokens: config.maxTokens }),
      temperature: config.temperature,
      response_format: config.supportsJsonMode ? { type: 'json_object' } : undefined,
    });

    const raw = completion.choices[0].message.content;
    debugLog('ANALYZE AI RESPONSE', raw);
    return { raw, modelUsed: modelId };
  }

  if (config.provider === 'anthropic') {
    const client = getAnthropicClient(apiKey);
    const message = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = message.content[0].text;
    debugLog('ANALYZE AI RESPONSE', raw);
    return { raw, modelUsed: modelId };
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}

export async function chatFollowUp({ matchData, playerData, initialReport, chatHistory, newMessage, modelId }) {
  const config = getModelConfig(modelId);
  const apiKey = process.env[config.apiKeyEnv];

  const systemPrompt = `你是一位 8000 分以上的 DOTA2 教练。当前对局数据和初始分析报告如下。请基于这些信息回答玩家的追问。`;

  const messages = [
    { role: 'user', content: `对局数据：${JSON.stringify(matchData)}\n\n初始报告：${JSON.stringify(initialReport)}` },
    { role: 'assistant', content: '报告已生成。' },
    ...chatHistory.flatMap((m) => [{ role: m.role, content: m.content }]),
    { role: 'user', content: newMessage },
  ];

  debugLog('CHAT SYSTEM PROMPT', systemPrompt);
  debugLog('CHAT MESSAGES', messages);

  if (config.provider === 'openai') {
    const client = getOpenAIClient(apiKey);
    const isNewGen = config.model.startsWith('gpt-5') || config.model.startsWith('o');
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      ...(isNewGen
        ? { max_completion_tokens: config.maxTokens }
        : { max_tokens: config.maxTokens }),
      temperature: config.temperature,
    });
    const reply = completion.choices[0].message.content;
    debugLog('CHAT AI RESPONSE', reply);
    return { reply, modelUsed: modelId };
  }

  if (config.provider === 'anthropic') {
    const client = getAnthropicClient(apiKey);
    const message = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages,
    });
    const reply = message.content[0].text;
    debugLog('CHAT AI RESPONSE', reply);
    return { reply, modelUsed: modelId };
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}
