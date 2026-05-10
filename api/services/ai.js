import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getModelConfig } from '../config/models.config.js';

const openaiClients = {};
const anthropicClients = {};

function getOpenAIClient(apiKey) {
  if (!openaiClients[apiKey]) {
    openaiClients[apiKey] = new OpenAI({ apiKey });
  }
  return openaiClients[apiKey];
}

function getAnthropicClient(apiKey) {
  if (!anthropicClients[apiKey]) {
    anthropicClients[apiKey] = new Anthropic({ apiKey });
  }
  return anthropicClients[apiKey];
}

export async function analyzeMatch({ matchData, playerData, matchSummary, ragDocs, modelId }) {
  const config = getModelConfig(modelId);
  const apiKey = process.env[config.apiKeyEnv];

  const ragContext = ragDocs.length
    ? '以下是几篇与当前对局最相关的高手复盘参考：\n\n' +
      ragDocs.map((doc, i) => `--- 参考 ${i + 1} ---\n${doc.body}`).join('\n\n') +
      '\n\n请结合以上参考思路，'
    : '（本次分析未检索到相关知识库内容，将完全基于对局数据进行分析。）\n\n';

  const systemPrompt = `你是一位 8000 分以上的 DOTA2 教练，擅长通过数据帮助玩家提升水平。你的分析风格直接、具体，不泛泛而谈。你会结合具体数据指出问题，并给出可操作的改进建议。输出必须严格按 JSON 格式。`;

  const userPrompt = `${ragContext}分析以下对局数据：\n\n对局摘要：${JSON.stringify(matchSummary, null, 2)}\n\n玩家详细数据：${JSON.stringify(playerData, null, 2)}\n\n请按以下 JSON 格式返回分析结果（turningPoint 只写最关键的 1 个转折点）：\n{\n  "overview": "100字内总评",\n  "turningPoint": "描述局势最关键的1个转折点及原因",\n  "laning": "对线期分析",\n  "midGame": "中期分析",\n  "lateGame": "后期分析（如适用）",\n  "itemBuild": "装备评价",\n  "skillBuild": "技能加点评价",\n  "keyMistakes": ["具体失误1", "具体失误2", "具体失误3"],\n  "improvements": ["可操作建议1", "可操作建议2", "可操作建议3"]\n}`;

  if (config.provider === 'openai') {
    const client = getOpenAIClient(apiKey);
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      response_format: config.supportsJsonMode ? { type: 'json_object' } : undefined,
    });

    const raw = completion.choices[0].message.content;
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

  if (config.provider === 'openai') {
    const client = getOpenAIClient(apiKey);
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });
    return { reply: completion.choices[0].message.content, modelUsed: modelId };
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
    return { reply: message.content[0].text, modelUsed: modelId };
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}
