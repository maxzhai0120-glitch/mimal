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

  const systemPrompt = `你是一位 8000 分以上的 DOTA2 教练，擅长通过数据帮助玩家提升水平。你的分析风格直接、具体，不泛泛而谈。你会结合具体数据指出问题，并给出可操作的改进建议。输出必须严格按 JSON 格式。`;

  const userPrompt = `${ragContext}分析以下对局数据：\n\n对局摘要：${JSON.stringify(matchSummary, null, 2)}\n\n玩家详细数据：${JSON.stringify(playerData, null, 2)}\n\n阵容信息：\n天辉：${radiantHeroes.join('、')}\n夜魇：${direHeroes.join('、')}\n分析目标英雄：${targetHero}\n推断位置：${playerData.inferredPositionName || '未知'}（置信度：${playerData.positionConfidence || 'low'}）${positionGuidance}\n\n请按以下 JSON 格式返回分析结果（turningPoint 只写最关键的 1 个转折点）：\n{\n  "overview": "100字内总评",\n  "turningPoint": "描述局势最关键的1个转折点及原因",\n  "draftAnalysis": "阵容分析：针对该英雄，这局对线好不好打、后期好不好发挥、对面有哪些英雄要特别注意、己方阵容搭配如何",\n  "laning": "对线期分析",\n  "midGame": "中期分析",\n  "lateGame": "后期分析（如适用）",\n  "itemBuild": "装备评价",\n  "skillBuild": "技能加点评价",\n  "keyMistakes": ["具体失误1", "具体失误2", "具体失误3"],\n  "improvements": ["可操作建议1", "可操作建议2", "可操作建议3"]\n}`;

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
