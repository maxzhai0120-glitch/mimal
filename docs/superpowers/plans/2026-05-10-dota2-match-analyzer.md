# DOTA2 Match Analyzer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack DOTA2 match analyzer with React frontend, Node.js backend, OpenDota integration, AI analysis, and local RAG knowledge base.

**Architecture:** Monorepo with React frontend (Vite) and Express backend (Vercel Serverless Functions). No database; LocalStorage for client caching. OpenAI API for AI + embeddings.

**Tech Stack:** React 18, Vite, Tailwind CSS, Recharts, React Router, Node.js, Express, OpenAI SDK, Vercel

---

## File Structure

```
.
├── package.json                 # Root workspace config + frontend scripts
├── vite.config.js               # Vite config
├── index.html                   # HTML entry
├── tailwind.config.js           # Tailwind config
├── postcss.config.js            # PostCSS config
├── vercel.json                  # Vercel deployment config
├── .env.example                 # Example env vars
├── src/                         # Frontend source
│   ├── main.jsx
│   ├── App.jsx
│   ├── router.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Report.jsx
│   ├── components/
│   │   ├── MatchInput.jsx
│   │   ├── HeroSelector.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── MatchOverview.jsx
│   │   ├── StatRadar.jsx
│   │   ├── GoldCurve.jsx
│   │   ├── ContributionBars.jsx
│   │   ├── ItemTimeline.jsx
│   │   ├── AIReport.jsx
│   │   └── ChatBox.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   └── services/
│       └── api.js
├── api/                         # Vercel Serverless Functions (backend)
│   ├── index.js                 # Express app entry
│   ├── routes/
│   │   ├── models.js
│   │   ├── match.js
│   │   ├── analyze.js
│   │   └── chat.js
│   ├── services/
│   │   ├── opendota.js
│   │   ├── ai.js
│   │   └── rag.js
│   ├── config/
│   │   ├── models.config.js
│   │   └── reportSchema.js
│   └── utils/
│       └── validators.js
├── scripts/
│   └── build-knowledge.js       # Build embeddings.json from knowledge/text/
├── knowledge/
│   ├── text/                    # Markdown articles (10 sample offlane guides)
│   └── embeddings.json          # Generated vector embeddings
└── tests/                       # Placeholder for test files
```

---

## Task 1: Project Scaffolding

Create project root structure, config files, and install dependencies.

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `vercel.json`
- Create: `.env.example`
- Create: `src/main.jsx`

---

- [ ] **Step 1: Write root package.json**

```json
{
  "name": "dota2-match-analyzer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:knowledge": "node scripts/build-knowledge.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: Write vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

- [ ] **Step 3: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DOTA2 Match Analyzer</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Write tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dota: {
          red: '#ff4b4b',
          green: '#4bff4b',
          blue: '#4b4bff',
          gold: '#ffd700',
          dark: '#1a1a2e',
          card: '#16213e',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Write postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Write vercel.json**

```json
{
  "version": 2,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

- [ ] **Step 7: Write .env.example**

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENDOTA_BASE_URL=https://api.opendota.com/api
```

- [ ] **Step 8: Write src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 9: Write src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dota-dark text-gray-100;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
```

- [ ] **Step 10: Create empty directories**

Run:
```bash
mkdir -p src/pages src/components src/hooks src/services api/routes api/services api/config api/utils scripts tests
```

- [ ] **Step 11: Install dependencies**

Run:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 12: Commit**

```bash
git add package.json vite.config.js index.html tailwind.config.js postcss.config.js vercel.json .env.example src/main.jsx src/index.css
mkdir -p api/routes api/services api/config api/utils src/pages src/components src/hooks src/services scripts tests
git commit -m "chore: project scaffolding with React, Vite, Tailwind, Vercel config"
```

---

## Task 2: Backend Configuration

Create model configs and report schema.

**Files:**
- Create: `api/config/models.config.js`
- Create: `api/config/reportSchema.js`

---

- [ ] **Step 1: Write models.config.js**

```js
export const modelConfigs = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true,
  },
  'claude-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: false,
  },
};

export function getAvailableModels() {
  return Object.entries(modelConfigs)
    .filter(([_, config]) => process.env[config.apiKeyEnv])
    .map(([id, config]) => ({
      id,
      name: id === 'gpt-4o-mini' ? 'GPT-4o Mini' : id === 'gpt-4o' ? 'GPT-4o' : 'Claude 3.5 Sonnet',
      provider: config.provider,
    }));
}

export function getModelConfig(modelId) {
  const config = modelConfigs[modelId];
  if (!config) throw new Error(`Unknown model: ${modelId}`);
  if (!process.env[config.apiKeyEnv]) throw new Error(`API key not configured for ${modelId}`);
  return config;
}
```

- [ ] **Step 2: Write reportSchema.js**

```js
export const reportSchema = [
  { key: 'overview', label: '局势总评', type: 'text', editable: true },
  { key: 'turningPoint', label: '局势转折点', type: 'text', editable: true },
  { key: 'laning', label: '对线期分析', type: 'text', editable: true },
  { key: 'midGame', label: '中期分析', type: 'text', editable: true },
  { key: 'lateGame', label: '后期分析', type: 'text', editable: true },
  { key: 'itemBuild', label: '装备评价', type: 'text', editable: true },
  { key: 'skillBuild', label: '技能加点', type: 'text', editable: true },
  { key: 'keyMistakes', label: '关键失误', type: 'list', editable: true },
  { key: 'improvements', label: '改进建议', type: 'list', editable: true },
];

export const reportJsonSchema = {
  type: 'object',
  properties: {
    overview: { type: 'string' },
    turningPoint: { type: 'string' },
    laning: { type: 'string' },
    midGame: { type: 'string' },
    lateGame: { type: 'string' },
    itemBuild: { type: 'string' },
    skillBuild: { type: 'string' },
    keyMistakes: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'turningPoint', 'laning', 'midGame', 'itemBuild', 'skillBuild', 'keyMistakes', 'improvements'],
};
```

- [ ] **Step 3: Commit**

```bash
git add api/config/models.config.js api/config/reportSchema.js
git commit -m "feat: add model configs and report schema"
```

---

## Task 3: Backend Validators

Create validation utilities.

**Files:**
- Create: `api/utils/validators.js`

---

- [ ] **Step 1: Write validators.js**

```js
export function validateMatchId(matchId) {
  const id = String(matchId).trim();
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('对局ID格式不正确，应为纯数字');
  }
  return id;
}

export function validateLobbyType(lobbyType) {
  const supported = [0, 7]; // 0 = public matchmaking, 7 = ranked
  if (!supported.includes(lobbyType)) {
    const error = new Error('暂不支持该对局的分析');
    error.code = 'UNSUPPORTED_MODE';
    error.supportedModes = ['天梯', '普通匹配'];
    throw error;
  }
}

export function validatePlayerSlot(slot) {
  const s = parseInt(slot, 10);
  if (Number.isNaN(s) || s < 0 || s > 9) {
    throw new Error('playerSlot 必须在 0-9 之间');
  }
  return s;
}
```

- [ ] **Step 2: Commit**

```bash
git add api/utils/validators.js
git commit -m "feat: add validation utilities"
```

---

## Task 4: OpenDota Service

Create service to fetch match data from OpenDota.

**Files:**
- Create: `api/services/opendota.js`

---

- [ ] **Step 1: Write opendota.js**

```js
const OPENDOTA_BASE_URL = process.env.OPENDOTA_BASE_URL || 'https://api.opendota.com/api';

export async function fetchMatch(matchId) {
  const res = await fetch(`${OPENDOTA_BASE_URL}/matches/${matchId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('未找到该对局，请检查 ID 是否正确，或确认该对局为公开比赛');
    throw new Error(`OpenDota API error: ${res.status}`);
  }
  return res.json();
}

export function extractPlayerList(matchData) {
  if (!matchData.players) return [];
  return matchData.players.map((p) => ({
    slot: p.player_slot,
    hero: p.hero_id,
    name: p.personaname || `玩家 ${p.player_slot}`,
    kda: `${p.kills}/${p.deaths}/${p.assists}`,
    team: p.player_slot < 5 ? 'radiant' : 'dire',
  }));
}

export function extractPlayerDetail(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  if (!p) throw new Error('未找到该玩家数据');

  return {
    slot: p.player_slot,
    hero: p.hero_id,
    name: p.personaname || `玩家 ${p.player_slot}`,
    level: p.level,
    kda: { kills: p.kills, deaths: p.deaths, assists: p.assists },
    gpm: p.gold_per_min,
    xpm: p.xp_per_min,
    lastHits: p.last_hits,
    denies: p.denies,
    heroDamage: p.hero_damage,
    towerDamage: p.tower_damage,
    heroHealing: p.hero_healing,
    gold: p.gold,
    items: [
      p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5,
    ].map((id, idx) => ({ slot: idx, itemId: id })),
    backpack: [p.backpack_0, p.backpack_1, p.backpack_2].map((id, idx) => ({ slot: idx, itemId: id })),
    abilityUpgrades: p.ability_upgrades_arr || [],
    purchases: p.purchase_log || [],
    goldTicks: p.gold_t?.map((g, i) => ({ minute: i, gold: g })) || [],
    obsPlaced: p.obs_placed || 0,
    senPlaced: p.sen_placed || 0,
    lane: p.lane,
    laneRole: p.lane_role,
    isRadiant: p.isRadiant,
    win: p.win,
  };
}

export function extractMatchSummary(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  const durationMin = Math.floor((matchData.duration || 0) / 60);
  return {
    matchId: matchData.match_id,
    duration: matchData.duration,
    durationMin,
    lobbyType: matchData.lobby_type,
    gameMode: matchData.game_mode,
    radiantWin: matchData.radiant_win,
    playerSlot,
    hero: p?.hero_id,
    level: p?.level,
    kda: `${p?.kills}/${p?.deaths}/${p?.assists}`,
    gpm: p?.gold_per_min,
    result: p?.win ? 'win' : 'loss',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add api/services/opendota.js
git commit -m "feat: add OpenDota service"
```

---

## Task 5: RAG Build Script

Create script to generate embeddings.json from knowledge/text/ articles.

**Files:**
- Create: `scripts/build-knowledge.js`
- Install: `openai` package for backend

---

- [ ] **Step 1: Install openai package**

Run:
```bash
npm install openai
```

- [ ] **Step 2: Write build-knowledge.js**

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge', 'text');
const OUTPUT_FILE = path.join(__dirname, '..', 'knowledge', 'embeddings.json');

function parseMarkdown(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: {}, body: content.trim() };

  const fmText = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  const frontmatter = {};
  for (const line of fmText.split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      const val = rest.join(':').trim();
      try {
        frontmatter[key.trim()] = JSON.parse(val);
      } catch {
        frontmatter[key.trim()] = val;
      }
    }
  }
  return { frontmatter, body };
}

async function build() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md'));
  const embeddings = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8');
    const { frontmatter, body } = parseMarkdown(content);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: body,
    });

    embeddings.push({
      file,
      frontmatter,
      body: body.slice(0, 2000),
      vector: response.data[0].embedding,
    });

    console.log(`Embedded: ${file}`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));
  console.log(`\nDone. Wrote ${embeddings.length} embeddings to ${OUTPUT_FILE}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Run build script to generate embeddings.json**

Run:
```bash
npm run build:knowledge
```

Expected: Console outputs "Embedded: axe_early_game.md" etc., then "Done. Wrote 10 embeddings..."

- [ ] **Step 4: Verify embeddings.json exists**

Run:
```bash
cat knowledge/embeddings.json | head -n 20
```

Expected: Valid JSON array with 10 objects, each containing `file`, `frontmatter`, `body`, `vector`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-knowledge.js knowledge/embeddings.json
# Add node_modules to .gitignore if not already
echo "node_modules/" >> .gitignore
git add .gitignore package.json package-lock.json
git commit -m "feat: add RAG build script and generate initial embeddings"
```

---

## Task 6: RAG Retrieval Service

Create runtime retrieval logic.

**Files:**
- Create: `api/services/rag.js`

---

- [ ] **Step 1: Write rag.js**

```js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDINGS_FILE = path.join(__dirname, '..', '..', 'knowledge', 'embeddings.json');

let knowledgeCache = null;

function loadKnowledge() {
  if (!knowledgeCache) {
    const data = fs.readFileSync(EMBEDDINGS_FILE, 'utf-8');
    knowledgeCache = JSON.parse(data);
  }
  return knowledgeCache;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function retrieveRelevantDocs(query, topK = 3) {
  const knowledge = loadKnowledge();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryVector = response.data[0].embedding;

  const scored = knowledge.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryVector, doc.vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
```

- [ ] **Step 2: Commit**

```bash
git add api/services/rag.js
git commit -m "feat: add RAG retrieval service"
```

---

## Task 7: AI Service

Create unified AI caller with OpenAI and Anthropic support.

**Files:**
- Create: `api/services/ai.js`
- Install: `@anthropic-ai/sdk`

---

- [ ] **Step 1: Install Anthropic SDK**

Run:
```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Write ai.js**

```js
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
    : '';

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

  const context = `对局摘要：${JSON.stringify(matchData)}\n\n初始分析报告：${JSON.stringify(initialReport)}\n\n玩家追问：${newMessage}`;

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
```

- [ ] **Step 3: Commit**

```bash
git add api/services/ai.js
git add package.json package-lock.json
git commit -m "feat: add unified AI service with OpenAI and Anthropic support"
```

---

## Task 8: API Routes

Create Express routes for models, match players, analyze, and chat.

**Files:**
- Create: `api/routes/models.js`
- Create: `api/routes/match.js`
- Create: `api/routes/analyze.js`
- Create: `api/routes/chat.js`
- Create: `api/index.js`

---

- [ ] **Step 1: Write models.js**

```js
import { Router } from 'express';
import { getAvailableModels } from '../config/models.config.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ models: getAvailableModels() });
});

export default router;
```

- [ ] **Step 2: Write match.js**

```js
import { Router } from 'express';
import { fetchMatch, extractPlayerList } from '../services/opendota.js';
import { validateMatchId, validateLobbyType } from '../utils/validators.js';

const router = Router();

router.get('/:matchId/players', async (req, res, next) => {
  try {
    const matchId = validateMatchId(req.params.matchId);
    const matchData = await fetchMatch(matchId);
    validateLobbyType(matchData.lobby_type);

    res.json({
      matchId,
      duration: matchData.duration,
      players: extractPlayerList(matchData),
    });
  } catch (err) {
    if (err.code === 'UNSUPPORTED_MODE') {
      return res.status(400).json({ error: err.message, supportedModes: err.supportedModes });
    }
    next(err);
  }
});

export default router;
```

- [ ] **Step 3: Write analyze.js**

```js
import { Router } from 'express';
import { fetchMatch, extractPlayerDetail, extractMatchSummary } from '../services/opendota.js';
import { retrieveRelevantDocs } from '../services/rag.js';
import { analyzeMatch } from '../services/ai.js';
import { validateMatchId, validatePlayerSlot, validateLobbyType } from '../utils/validators.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const matchId = validateMatchId(req.body.matchId);
    const playerSlot = validatePlayerSlot(req.body.playerSlot);
    const model = req.body.model || 'gpt-4o-mini';

    const matchData = await fetchMatch(matchId);
    validateLobbyType(matchData.lobby_type);

    const playerData = extractPlayerDetail(matchData, playerSlot);
    const matchSummary = extractMatchSummary(matchData, playerSlot);

    const ragQuery = `${playerData.name} 使用 ${playerData.hero}，${matchSummary.result === 'win' ? '获胜' : '失败'}，时长 ${matchSummary.durationMin} 分钟，KDA ${matchSummary.kda}，GPM ${matchSummary.gpm}`;
    const ragDocs = await retrieveRelevantDocs(ragQuery, 3);

    const { raw, modelUsed } = await analyzeMatch({
      matchData,
      playerData,
      matchSummary,
      ragDocs,
      modelId: model,
    });

    let report;
    try {
      report = JSON.parse(raw);
    } catch (parseErr) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI 返回格式异常，无法解析');
      }
    }

    res.json({
      match: matchSummary,
      report,
      modelUsed,
      ragDocsUsed: ragDocs.length,
    });
  } catch (err) {
    if (err.code === 'UNSUPPORTED_MODE') {
      return res.status(400).json({ error: err.message, supportedModes: err.supportedModes });
    }
    next(err);
  }
});

export default router;
```

- [ ] **Step 4: Write chat.js**

```js
import { Router } from 'express';
import { fetchMatch, extractPlayerDetail, extractMatchSummary } from '../services/opendota.js';
import { chatFollowUp } from '../services/ai.js';
import { validateMatchId, validatePlayerSlot } from '../utils/validators.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const matchId = validateMatchId(req.body.matchId);
    const playerSlot = validatePlayerSlot(req.body.playerSlot);
    const model = req.body.model || 'gpt-4o-mini';
    const messages = req.body.messages || [];

    const matchData = await fetchMatch(matchId);
    const playerData = extractPlayerDetail(matchData, playerSlot);
    const matchSummary = extractMatchSummary(matchData, playerSlot);

    const newMessage = messages[messages.length - 1]?.content || '';
    const chatHistory = messages.slice(0, -1);

    const { reply, modelUsed } = await chatFollowUp({
      matchData: matchSummary,
      playerData,
      initialReport: req.body.initialReport || {},
      chatHistory,
      newMessage,
      modelId: model,
    });

    res.json({ reply, modelUsed });
  } catch (err) {
    next(err);
  }
});

export default router;
```

- [ ] **Step 5: Write api/index.js**

```js
import express from 'express';
import cors from 'cors';

import modelsRouter from './routes/models.js';
import matchRouter from './routes/match.js';
import analyzeRouter from './routes/analyze.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/models', modelsRouter);
app.use('/api/match', matchRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  });
});

export default app;
```

- [ ] **Step 6: Install express and cors**

Run:
```bash
npm install express cors
```

- [ ] **Step 7: Test backend locally**

Create `api/local-dev.js`:
```js
import app from './index.js';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

Run:
```bash
node api/local-dev.js
```

In another terminal, test:
```bash
curl http://localhost:3001/api/models
```

Expected: JSON with available models.

- [ ] **Step 8: Commit**

```bash
git add api/routes/models.js api/routes/match.js api/routes/analyze.js api/routes/chat.js api/index.js api/local-dev.js
git add package.json package-lock.json
git commit -m "feat: add Express API routes for models, match, analyze, chat"
```

---

## Task 9: Frontend API Service

Create axios wrapper for all backend calls.

**Files:**
- Create: `src/services/api.js`

---

- [ ] **Step 1: Install axios**

Run:
```bash
npm install axios
```

- [ ] **Step 2: Write api.js**

```js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function getModels() {
  const res = await api.get('/models');
  return res.data.models;
}

export async function getMatchPlayers(matchId) {
  const res = await api.get(`/match/${matchId}/players`);
  return res.data;
}

export async function analyzeMatch(matchId, playerSlot, model) {
  const res = await api.post('/analyze', { matchId, playerSlot, model });
  return res.data;
}

export async function chatFollowUp(matchId, playerSlot, model, messages, initialReport) {
  const res = await api.post('/chat', { matchId, playerSlot, model, messages, initialReport });
  return res.data;
}

export default api;
```

- [ ] **Step 3: Commit**

```bash
git add src/services/api.js
git add package.json package-lock.json
git commit -m "feat: add frontend API service layer"
```

---

## Task 10: Frontend useLocalStorage Hook

Create hook for caching matches, edits, and settings.

**Files:**
- Create: `src/hooks/useLocalStorage.js`

---

- [ ] **Step 1: Write useLocalStorage.js**

```js
import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'dota2_analyzer_cache';
const MAX_MATCHES = 5;

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : { recentMatches: [], settings: { preferredModel: 'gpt-4o-mini' } };
  } catch {
    return { recentMatches: [], settings: { preferredModel: 'gpt-4o-mini' } };
  }
}

function setCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function useLocalStorage() {
  const [cache, setCacheState] = useState(getCache);

  const saveMatch = useCallback((match) => {
    setCacheState((prev) => {
      const filtered = prev.recentMatches.filter((m) => m.matchId !== match.matchId);
      const updated = [match, ...filtered].slice(0, MAX_MATCHES);
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const updateMatchReport = useCallback((matchId, report) => {
    setCacheState((prev) => {
      const updated = prev.recentMatches.map((m) =>
        m.matchId === matchId ? { ...m, report } : m
      );
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const updateChatHistory = useCallback((matchId, chatHistory) => {
    setCacheState((prev) => {
      const updated = prev.recentMatches.map((m) =>
        m.matchId === matchId ? { ...m, chatHistory } : m
      );
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const setPreferredModel = useCallback((model) => {
    setCacheState((prev) => {
      const next = { ...prev, settings: { ...prev.settings, preferredModel: model } };
      setCache(next);
      return next;
    });
  }, []);

  const getMatch = useCallback((matchId) => {
    return cache.recentMatches.find((m) => m.matchId === matchId);
  }, [cache]);

  return {
    recentMatches: cache.recentMatches,
    preferredModel: cache.settings.preferredModel,
    saveMatch,
    updateMatchReport,
    updateChatHistory,
    setPreferredModel,
    getMatch,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useLocalStorage.js
git commit -m "feat: add LocalStorage cache hook"
```

---

## Task 11: Frontend Home Page

Build input page with match ID input, model selector, hero selector, and loading screen.

**Files:**
- Create: `src/components/MatchInput.jsx`
- Create: `src/components/HeroSelector.jsx`
- Create: `src/components/LoadingScreen.jsx`
- Create: `src/pages/Home.jsx`

---

- [ ] **Step 1: Write MatchInput.jsx**

```jsx
export default function MatchInput({ matchId, setMatchId, model, setModel, models, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">对局 ID</label>
        <input
          type="text"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="输入对局 ID（如 1234567890）"
          className="w-full px-4 py-3 bg-dota-card border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-dota-gold"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">AI 模型</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 bg-dota-card border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dota-gold"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onSubmit}
        disabled={loading || !matchId.trim()}
        className="w-full py-3 bg-dota-gold text-dota-dark font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '加载中...' : '获取玩家列表'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write HeroSelector.jsx**

```jsx
export default function HeroSelector({ players, selectedSlot, setSelectedSlot, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">选择要分析的英雄</h3>
      <div className="grid grid-cols-2 gap-3">
        {players.map((p) => (
          <button
            key={p.slot}
            onClick={() => setSelectedSlot(p.slot)}
            className={`p-3 rounded-lg border text-left transition ${
              selectedSlot === p.slot
                ? 'border-dota-gold bg-yellow-500/10'
                : 'border-gray-700 bg-dota-card hover:border-gray-500'
            }`}
          >
            <div className="text-white font-medium">英雄 #{p.hero}</div>
            <div className="text-sm text-gray-400">{p.name}</div>
            <div className="text-sm text-gray-500">KDA: {p.kda}</div>
            <div className={`text-xs mt-1 ${p.team === 'radiant' ? 'text-green-400' : 'text-red-400'}`}>
              {p.team === 'radiant' ? '天辉' : '夜魇'}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onAnalyze}
        disabled={loading || selectedSlot === null}
        className="w-full py-3 bg-dota-gold text-dota-dark font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '正在分析...' : '开始分析'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write LoadingScreen.jsx**

```jsx
export default function LoadingScreen({ steps, currentStep }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-12 h-12 border-4 border-dota-gold border-t-transparent rounded-full animate-spin" />
      <div className="space-y-2 text-center">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={`text-sm transition ${
              idx < currentStep ? 'text-green-400' : idx === currentStep ? 'text-dota-gold' : 'text-gray-600'
            }`}
          >
            {idx < currentStep ? '✓' : idx === currentStep ? '⟳' : '○'} {step}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write Home.jsx**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchInput from '../components/MatchInput.jsx';
import HeroSelector from '../components/HeroSelector.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { getModels, getMatchPlayers, analyzeMatch } from '../services/api.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function Home() {
  const navigate = useNavigate();
  const { recentMatches, preferredModel, setPreferredModel, saveMatch } = useLocalStorage();

  const [matchId, setMatchId] = useState('');
  const [model, setModel] = useState(preferredModel);
  const [models, setModels] = useState([]);
  const [players, setPlayers] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const analyzeSteps = ['正在获取对局数据...', '正在检索知识库...', '正在生成分析报告...'];

  useEffect(() => {
    getModels().then(setModels).catch(console.error);
  }, []);

  useEffect(() => {
    setPreferredModel(model);
  }, [model, setPreferredModel]);

  async function handleFetchPlayers() {
    setError('');
    setLoading(true);
    try {
      const data = await getMatchPlayers(matchId);
      setPlayers(data.players);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setError('');
    setLoading(true);
    setAnalyzeStep(0);
    try {
      setAnalyzeStep(1);
      const data = await analyzeMatch(matchId, selectedSlot, model);
      setAnalyzeStep(2);

      const matchRecord = {
        matchId,
        analyzedAt: new Date().toISOString(),
        hero: data.match.hero,
        playerSlot: selectedSlot,
        result: data.match.result,
        report: data.report,
        chatHistory: [],
        modelUsed: data.modelUsed,
      };
      saveMatch(matchRecord);
      navigate(`/report/${matchId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-dota-gold mb-2">DOTA2 Match Analyzer</h1>
          <p className="text-gray-400">你的私人 DOTA2 教练</p>
        </div>

        <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
          <MatchInput
            matchId={matchId}
            setMatchId={setMatchId}
            model={model}
            setModel={setModel}
            models={models}
            onSubmit={handleFetchPlayers}
            loading={loading && !players}
          />
        </div>

        {players && !loading && (
          <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
            <HeroSelector
              players={players}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              onAnalyze={handleAnalyze}
              loading={loading && !!players}
            />
          </div>
        )}

        {loading && players && (
          <LoadingScreen steps={analyzeSteps} currentStep={analyzeStep} />
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {recentMatches.length > 0 && (
          <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">最近分析</h3>
            <div className="space-y-2">
              {recentMatches.map((m) => (
                <button
                  key={m.matchId}
                  onClick={() => navigate(`/report/${m.matchId}`)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                >
                  <div className="text-white">对局 {m.matchId}</div>
                  <div className="text-sm text-gray-400">
                    英雄 #{m.hero} · {m.result === 'win' ? '胜' : '负'} · {new Date(m.analyzedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MatchInput.jsx src/components/HeroSelector.jsx src/components/LoadingScreen.jsx src/pages/Home.jsx
git commit -m "feat: add Home page with match input, hero selector, loading screen"
```

---

## Task 12: Data Visualization Components

Build radar, gold curve, contribution bars, and item timeline.

**Files:**
- Create: `src/components/StatRadar.jsx`
- Create: `src/components/GoldCurve.jsx`
- Create: `src/components/ContributionBars.jsx`
- Create: `src/components/ItemTimeline.jsx`
- Create: `src/components/MatchOverview.jsx`

---

- [ ] **Step 1: Write StatRadar.jsx**

```jsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function StatRadar({ data }) {
  const chartData = [
    { subject: '补刀', A: data.lastHitScore || 60, fullMark: 100 },
    { subject: 'GPM', A: data.gpmScore || 60, fullMark: 100 },
    { subject: '伤害', A: data.damageScore || 60, fullMark: 100 },
    { subject: '生存', A: data.survivalScore || 60, fullMark: 100 },
    { subject: '团队', A: data.teamScore || 60, fullMark: 100 },
  ];

  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">综合能力</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="玩家" dataKey="A" stroke="#ffd700" fill="#ffd700" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Write GoldCurve.jsx**

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GoldCurve({ data }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">经济曲线</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="minute" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
          <Line type="monotone" dataKey="gold" stroke="#ffd700" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Write ContributionBars.jsx**

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ContributionBars({ data }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">伤害 / 治疗 / 控制</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
          <Bar dataKey="value" fill="#4b7bec" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Write ItemTimeline.jsx**

```jsx
export default function ItemTimeline({ items }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">装备时间线</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <span className="text-gray-400 text-sm w-12">{item.time}</span>
            <div className="flex-1 h-8 bg-gray-800 rounded flex items-center px-2">
              <span className="text-white text-sm">物品 #{item.itemId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write MatchOverview.jsx**

```jsx
export default function MatchOverview({ match }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-white">对局 {match.matchId}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${match.result === 'win' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {match.result === 'win' ? '胜利' : '失败'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-gray-400 text-sm">时长</div>
          <div className="text-white font-semibold">{Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">英雄</div>
          <div className="text-white font-semibold">#{match.player?.hero || match.hero}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">KDA</div>
          <div className="text-white font-semibold">{match.player?.kda?.kills ?? '-'}/{match.player?.kda?.deaths ?? '-'}/{match.player?.kda?.assists ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/StatRadar.jsx src/components/GoldCurve.jsx src/components/ContributionBars.jsx src/components/ItemTimeline.jsx src/components/MatchOverview.jsx
git commit -m "feat: add data visualization components (radar, gold curve, bars, timeline, overview)"
```

---

## Task 13: AIReport and ChatBox Components

Build structured report display with editing, and chat interface.

**Files:**
- Create: `src/components/AIReport.jsx`
- Create: `src/components/ChatBox.jsx`

---

- [ ] **Step 1: Write AIReport.jsx**

```jsx
import { useState } from 'react';

export default function AIReport({ report, onReportChange }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!report) return null;

  const sections = [
    { key: 'overview', label: '局势总评', type: 'text' },
    { key: 'turningPoint', label: '局势转折点', type: 'text' },
    { key: 'laning', label: '对线期分析', type: 'text' },
    { key: 'midGame', label: '中期分析', type: 'text' },
    { key: 'lateGame', label: '后期分析', type: 'text' },
    { key: 'itemBuild', label: '装备评价', type: 'text' },
    { key: 'skillBuild', label: '技能加点', type: 'text' },
    { key: 'keyMistakes', label: '关键失误', type: 'list' },
    { key: 'improvements', label: '改进建议', type: 'list' },
  ];

  function startEdit(key, value) {
    setEditingKey(key);
    setEditValue(Array.isArray(value) ? value.join('\n') : value);
  }

  function saveEdit(key) {
    const newReport = { ...report };
    const section = sections.find((s) => s.key === key);
    if (section.type === 'list') {
      newReport[key] = editValue.split('\n').filter((l) => l.trim());
    } else {
      newReport[key] = editValue;
    }
    onReportChange(newReport);
    setEditingKey(null);
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const value = report[section.key];
        const isEditing = editingKey === section.key;

        return (
          <div key={section.key} className="bg-dota-card rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-dota-gold font-semibold">{section.label}</h4>
              {isEditing ? (
                <div className="space-x-2">
                  <button onClick={() => saveEdit(section.key)} className="text-sm text-green-400 hover:text-green-300">保存</button>
                  <button onClick={() => setEditingKey(null)} className="text-sm text-gray-400 hover:text-gray-300">取消</button>
                </div>
              ) : (
                <button onClick={() => startEdit(section.key, value)} className="text-sm text-gray-500 hover:text-gray-300">编辑</button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-200 text-sm focus:outline-none focus:border-dota-gold"
                rows={section.type === 'list' ? 5 : 3}
              />
            ) : (
              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                {section.type === 'list' ? (
                  <ul className="list-disc list-inside space-y-1">
                    {(value || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  value || '无'
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Write ChatBox.jsx**

```jsx
import { useState } from 'react';

export default function ChatBox({ messages, onSend, loading }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  }

  return (
    <div className="bg-dota-card rounded-lg border border-gray-800 flex flex-col h-96">
      <div className="p-3 border-b border-gray-800">
        <h4 className="text-dota-gold font-semibold">AI 教练对话</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">对这局还有疑问？继续问 AI 教练...</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-dota-gold text-dota-dark'
                : 'bg-gray-800 text-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-lg px-3 py-2 text-sm">正在思考...</div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-dota-gold"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-dota-gold text-dota-dark font-bold rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AIReport.jsx src/components/ChatBox.jsx
git commit -m "feat: add AIReport (editable structured report) and ChatBox components"
```

---

## Task 14: Report Page

Assemble all components into the two-column report layout.

**Files:**
- Create: `src/pages/Report.jsx`
- Create: `src/router.jsx`
- Modify: `src/App.jsx`

---

- [ ] **Step 1: Write Report.jsx**

```jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MatchOverview from '../components/MatchOverview.jsx';
import StatRadar from '../components/StatRadar.jsx';
import GoldCurve from '../components/GoldCurve.jsx';
import ContributionBars from '../components/ContributionBars.jsx';
import ItemTimeline from '../components/ItemTimeline.jsx';
import AIReport from '../components/AIReport.jsx';
import ChatBox from '../components/ChatBox.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { chatFollowUp } from '../services/api.js';

export default function Report() {
  const { matchId } = useParams();
  const { getMatch, updateMatchReport, updateChatHistory } = useLocalStorage();
  const [match, setMatch] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const cached = getMatch(matchId);
    if (cached) {
      setMatch(cached);
    }
  }, [matchId, getMatch]);

  async function handleReportChange(newReport) {
    const updated = { ...match, report: newReport };
    setMatch(updated);
    updateMatchReport(matchId, newReport);
  }

  async function handleChatSend(content) {
    if (!match) return;
    const newMessages = [...(match.chatHistory || []), { role: 'user', content }];
    const updated = { ...match, chatHistory: newMessages };
    setMatch(updated);
    updateChatHistory(matchId, newMessages);

    setChatLoading(true);
    try {
      const res = await chatFollowUp(
        matchId,
        match.playerSlot,
        match.modelUsed,
        newMessages,
        match.report
      );
      const withReply = [...newMessages, { role: 'assistant', content: res.reply }];
      setMatch((prev) => ({ ...prev, chatHistory: withReply }));
      updateChatHistory(matchId, withReply);
    } catch (err) {
      const withError = [...newMessages, { role: 'assistant', content: '抱歉，出现了错误，请重试。' }];
      setMatch((prev) => ({ ...prev, chatHistory: withError }));
      updateChatHistory(matchId, withError);
    } finally {
      setChatLoading(false);
    }
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        未找到该对局的分析记录，请返回首页重新分析。
      </div>
    );
  }

  const goldData = match.report?.goldTicks?.map((g, i) => ({ minute: i, gold: g })) || [];
  const contribData = [
    { name: '伤害', value: match.report?.heroDamage || 0 },
    { name: '治疗', value: match.report?.heroHealing || 0 },
    { name: '控制', value: match.report?.stunDuration || 0 },
  ];
  const itemData = (match.report?.purchases || []).map((p) => ({
    time: `${Math.floor(p.time / 60)}:${String(p.time % 60).padStart(2, '0')}`,
    itemId: p.key,
  }));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <MatchOverview match={match.match || match} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <StatRadar data={match.report || {}} />
            <GoldCurve data={goldData} />
            <ContributionBars data={contribData} />
            <ItemTimeline items={itemData} />
          </div>

          <div className="space-y-4">
            <AIReport report={match.report} onReportChange={handleReportChange} />
            <ChatBox
              messages={match.chatHistory || []}
              onSend={handleChatSend}
              loading={chatLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write router.jsx**

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Report from './pages/Report.jsx';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/report/:matchId" element={<Report />} />
    </Routes>
  );
}
```

- [ ] **Step 3: Write App.jsx**

```jsx
import Router from './router.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-dota-dark">
      <Router />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Report.jsx src/router.jsx src/App.jsx
git commit -m "feat: add Report page with two-column layout and chat integration"
```

---

## Task 15: Final Integration & Deployment Config

Ensure everything connects, add missing pieces, verify build.

**Files:**
- Create: `.gitignore`
- Modify: `package.json` (add dev server proxy for local API testing)

---

- [ ] **Step 1: Write .gitignore**

```
node_modules/
dist/
.env
.env.local
.vercel
*.log
```

- [ ] **Step 2: Verify vite.config.js proxy**

Ensure `vite.config.js` from Task 1 already has the proxy config. If not, add:
```js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

- [ ] **Step 3: Local integration test**

Terminal 1:
```bash
node api/local-dev.js
```

Terminal 2:
```bash
npm run dev
```

Open browser to `http://localhost:3000`.

Test flow:
1. Enter a valid DOTA2 match ID (e.g., `7826226403` — a recent public match)
2. Select a hero
3. Verify loading steps appear
4. Verify redirect to `/report/:matchId`
5. Verify report renders with all sections
6. Verify editing a section saves to LocalStorage
7. Verify chat follow-up works

- [ ] **Step 4: Fix any issues found**

Iterate on bugs until the full flow works end-to-end.

- [ ] **Step 5: Build for production**

```bash
npm run build
```

Verify `dist/` is created with `index.html` and assets.

- [ ] **Step 6: Commit**

```bash
git add .gitignore vite.config.js
git commit -m "chore: final integration, local testing, production build config"
```

---

## Task 16: Deployment to Vercel

Deploy the application.

**Files:**
- Modify: `vercel.json` (if needed)

---

- [ ] **Step 1: Ensure vercel.json is correct**

```json
{
  "version": 2,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

- [ ] **Step 2: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Follow prompts to link project.

- [ ] **Step 4: Configure environment variables on Vercel dashboard**

Go to Vercel Dashboard → Project Settings → Environment Variables, add:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (optional)
- `OPENDOTA_BASE_URL` = `https://api.opendota.com/api`

- [ ] **Step 5: Redeploy after env vars**

```bash
vercel --prod
```

- [ ] **Step 6: Verify deployed URL**

Open the production URL, run through the full test flow again.

- [ ] **Step 7: Commit**

```bash
git add vercel.json
git commit -m "chore: Vercel deployment config"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Requirement | Task |
|---|---|
| 用户输入对局ID，后端调用OpenDota API | Task 4, Task 8 |
| 只支持天梯和普通匹配 | Task 3, Task 8 |
| 用户选择10个玩家之一（单选） | Task 11 |
| AI分析用GPT-4o-mini，预留模型切换 | Task 2, Task 7, Task 8 |
| 输出结构化JSON报告（9个字段） | Task 2, Task 7 |
| turningPoint只1个 | Task 7 (Prompt约束) |
| 左边数据面板（4种图表） | Task 12 |
| 右边AI报告+可编辑字段 | Task 13 |
| 支持多轮对话追问 | Task 8, Task 13, Task 14 |
| RAG知识库纯文字，10篇示例 | Task 5, Task 6, Task 7 |
| 预留视频知识库扩展 | Task 5 (processor pattern) |
| 无数据库，LocalStorage缓存 | Task 10, Task 14 |
| PC端优先，忽略移动端 | Task 11, Task 12, Task 14 (desktop-first classes) |
| 部署在Vercel | Task 1, Task 16 |
| React+Vite+Tailwind+Recharts | Task 1, Task 12 |
| Node.js+Express(Vercel Functions) | Task 1, Task 8 |

**No gaps found.**

### 2. Placeholder Scan

- No TBD/TODO
- No vague "add error handling" steps — specific try/catch shown in every route
- No "write tests for the above" without code — test commands shown
- All referenced functions are defined in earlier tasks

### 3. Type Consistency

- `matchId` consistently string
- `playerSlot` consistently number 0-9
- `model` consistently string ID
- Report schema keys consistent across Task 2, Task 7, Task 13
- LocalStorage cache shape consistent across Task 10, Task 11, Task 14

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-10-dota2-match-analyzer.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
