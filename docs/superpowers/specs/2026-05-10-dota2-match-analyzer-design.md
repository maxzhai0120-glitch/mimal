# DOTA2 Match Analyzer — Design Document

**Date:** 2026-05-10
**Status:** Draft, pending review
**Scope:** Phase 1 (MVP) — manual match ID input, single-hero analysis, text reports with charts, text-based RAG, no login

---

## 1. Project Overview

A web application that helps DOTA2 players improve by analyzing their match data. Users paste a match ID, select a hero/player from that match, and receive a structured AI-generated report with data visualizations. Users can ask follow-up questions in a chat interface.

### Core Value Proposition

Unlike asking ChatGPT directly, this product:
- Automatically fetches and structures match data from OpenDota API
- Presents multi-dimensional charts (radar, line, bar, item timeline)
- Outputs fixed-field structured reports (laning, mid-game, turning point, etc.)
- Supports follow-up conversation with automatic match context retention
- Provides RAG-enhanced analysis using a curated knowledge base of high-level player guides

### Supported Game Modes

Only **Ranked** (`lobby_type: 7`) and **Public Matchmaking** (`lobby_type: 0`) are supported. All other modes (Turbo, Ability Draft, custom games, bot matches) are rejected with:
```json
{ "error": "暂不支持该对局的分析", "supportedModes": ["天梯", "普通匹配"] }
```

---

## 2. System Architecture

```
User Browser
    │
    ▼
[ React Frontend ]  ←── Vercel Edge Network (Static Hosting)
    │
    ▼
[ Node.js + Express API ]  ←── Vercel Serverless Functions
    │
    ├──► OpenDota API ──► Match raw data
    │
    ├──► AI API (OpenAI / Anthropic / etc.) ──► Analysis text
    │
    ├──► RAG Knowledge Base ──► Relevant guides (local JSON)
    │
    └──► Model Config Service ──► Available models list
```

### Key Architectural Decisions

- **No database in Phase 1**: Analysis results are generated on-demand and cached in browser LocalStorage only. This minimizes infrastructure complexity.
- **Backend as unified gateway**: The frontend never calls OpenDota or AI APIs directly. All external calls go through the backend to avoid CORS issues and API key exposure.
- **Model abstraction layer**: A single `analyzeMatch(matchData, playerSlot, modelConfig)` function internally routes to the correct provider SDK. Adding a new provider requires only a config entry.
- **RAG local-first**: Knowledge base vectors are stored in a local JSON file (`embeddings.json`). No vector database is needed for the expected scale of hundreds of articles.

---

## 3. Frontend Design

### Tech Stack
- React 18 + Vite
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation

### Pages

#### Page 1: Home / Input (`/`)

- **Header**: Logo + tagline (e.g., "你的私人 DOTA2 教练")
- **Match ID Input**: Large text input with placeholder "输入对局 ID（如 1234567890）"
- **Model Selector**: Dropdown populated from `GET /api/models`, default `gpt-4o-mini`
- **Analyze Button**: Triggers loading state with step-by-step progress ("正在获取对局数据..." → "正在生成分析报告...")
- **Recent Analyses**: Displays last 5 cached matches from LocalStorage, clickable to jump to report

#### Page 2: Report (`/report/:matchId`)

Desktop-only layout (mobile deferred to Phase 2). Two-column layout:

**Left Column — Data Panel**
- Match Overview Card: Result, duration, hero played, KDA
- Radar Chart: Last-hitting, GPM, damage, survivability, team contribution vs. same-rank average
- Line Chart: Gold curve over time vs. average
- Bar Chart: Damage / Healing / Control values with rank among 10 players
- Item Timeline: Core items with purchase timestamps, color-coded against standard timing

**Right Column — AI Report + Chat**
- Structured report rendered from AI JSON response, sections:
  - Overview (局势总评)
  - Turning Point (局势转折点) — exactly 1 key fight identified
  - Laning (对线期分析)
  - Mid Game (中期分析)
  - Late Game (后期分析, if applicable)
  - Item Build (装备评价)
  - Skill Build (技能加点评价)
  - Key Mistakes (关键失误)
  - Improvements (改进建议)
- Each section has an **Edit button** allowing users to modify content. Changes saved to LocalStorage.
- Chat area below the report:
  - History of user follow-up questions and AI replies
  - Input box with placeholder: "对这局还有疑问？继续问 AI 教练..."

### Component List

| Component | Responsibility |
|---|---|
| `MatchInput` | Input field + model selector + submit logic |
| `LoadingScreen` | Step progress indicator |
| `HeroSelector` | Displays 10 players from match, single-select |
| `MatchOverview` | Basic match info card |
| `StatRadar` | Radar chart (Recharts) |
| `GoldCurve` | Line chart for gold over time |
| `ContributionBars` | Bar chart for damage/healing/control |
| `ItemTimeline` | Horizontal timeline of item purchases |
| `AIReport` | Renders structured report, supports editing |
| `ChatBox` | Multi-turn chat interface |

---

## 4. Backend API Design

### 4.1 Endpoints

#### GET `/api/models`

Returns available AI models based on backend configuration.

**Response:**
```json
{
  "models": [
    { "id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai" },
    { "id": "gpt-4o", "name": "GPT-4o", "provider": "openai" },
    { "id": "claude-sonnet", "name": "Claude 3.5 Sonnet", "provider": "anthropic" }
  ]
}
```

Only models with valid configured API keys are exposed.

#### GET `/api/match/:matchId/players`

Returns simplified player list for hero selection.

**Response:**
```json
{
  "matchId": "1234567890",
  "duration": 2143,
  "players": [
    { "slot": 0, "hero": "Axe", "name": "Player1", "kda": "4/8/12", "team": "radiant" },
    ...
  ]
}
```

If `lobby_type` is not ranked (7) or public (0), returns error immediately.

#### POST `/api/analyze`

Main analysis endpoint.

**Request Body:**
```json
{
  "matchId": "1234567890",
  "playerSlot": 0,
  "model": "gpt-4o-mini"
}
```

**Processing Flow:**
1. Fetch match data from OpenDota `/matches/{matchId}`
2. Validate `lobby_type`
3. Extract key metrics for the selected player
4. Build match summary for RAG retrieval
5. Retrieve top-K relevant documents from knowledge base
6. Construct Prompt (system role + RAG context + structured data + output schema)
7. Call AI API with JSON mode / structured output requirement
8. Validate AI response against expected schema
9. Return structured response

**Response:**
```json
{
  "match": {
    "matchId": "1234567890",
    "duration": 2143,
    "player": { "hero": "Axe", "slot": 0, "kda": "4/8/12", "gpm": 412, ... }
  },
  "report": {
    "overview": "...",
    "turningPoint": "...",
    "laning": "...",
    "midGame": "...",
    "lateGame": "...",
    "itemBuild": "...",
    "skillBuild": "...",
    "keyMistakes": ["...", "..."],
    "improvements": ["...", "..."]
  },
  "modelUsed": "gpt-4o-mini",
  "ragDocsUsed": 3
}
```

#### POST `/api/chat`

Handles follow-up questions.

**Request Body:**
```json
{
  "matchId": "1234567890",
  "playerSlot": 0,
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "为什么你说我中期不应该去刷野？" }
  ]
}
```

**Processing Flow:**
1. Re-fetch or cache-lookup match data
2. Re-fetch or cache-lookup initial report
3. Build conversation context: system prompt + match data + initial report + chat history + new question
4. Call AI API
5. Return reply

**Response:**
```json
{
  "reply": "因为你当时已经有 Echo Sabre 和 BKB 的组件...",
  "modelUsed": "gpt-4o-mini"
}
```

### 4.2 Model Configuration

```js
// config/models.config.js
export const modelConfigs = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: true
  },
  'claude-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    maxTokens: 4096,
    temperature: 0.7,
    supportsJsonMode: false
  }
};
```

Adding a new model: add one entry to this file. The frontend dropdown and backend routing automatically adapt.

---

## 5. AI Analysis Flow & Prompt Design

### 5.1 Data Extracted from OpenDota

For the selected player:
- Basic: hero, level, KDA, GPM, XPM, last hits, denies
- Economy: gold per minute timeline (per-minute array)
- Damage: hero damage, tower damage, healing, tower healing
- Items: purchase timestamps, item builds
- Abilities: ability upgrade order
- Teamfights: participation, deaths, key events
- Vision: observer wards placed, sentry wards placed, dewards
- Benchmarks: percentile rankings for GPM, XPM, KDA, etc. (via OpenDota benchmarks API)

### 5.2 RAG Integration

Before calling AI, retrieve top-K (default 3) relevant documents from the knowledge base.

**Retrieval Query:** A condensed match summary generated from the data, e.g.:
> "Offlane Axe, 34-minute loss, 412 GPM, 12-minute Blink Dagger, low teamfight participation after 20 min, died twice alone in enemy jungle."

**RAG Context Format in Prompt:**
```
以下是几篇与当前对局最相关的高手复盘参考：

--- 参考 1 ---
[文章内容]

--- 参考 2 ---
[文章内容]

请结合以上参考思路，分析以下对局数据...
```

### 5.3 Prompt Structure

**System Prompt:**
> 你是一位 8000 分以上的 DOTA2 教练，擅长通过数据帮助玩家提升水平。你的分析风格直接、具体，不泛泛而谈。你会结合具体数据指出问题，并给出可操作的改进建议。输出必须严格按 JSON 格式。

**User Prompt:**
```
对局数据摘要：
[结构化数据...]

请按以下 JSON 格式返回分析结果：
{
  "overview": "100字内总评",
  "turningPoint": "描述局势最关键的1个转折点及原因",
  "laning": "对线期分析",
  "midGame": "中期分析",
  "lateGame": "后期分析（如适用）",
  "itemBuild": "装备评价",
  "skillBuild": "技能加点评价",
  "keyMistakes": ["具体失误1", "具体失误2", "具体失误3"],
  "improvements": ["可操作建议1", "可操作建议2", "可操作建议3"]
}
```

### 5.4 Output Validation

Backend validates AI response:
1. Check if valid JSON
2. Check presence of all required keys
3. Check type constraints (strings, arrays)
4. If validation fails: attempt regex extraction, fallback to error state

---

## 6. Data Model & Report Schema

### 6.1 Report Schema (Configurable)

Defined in `config/reportSchema.js`:

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
  { key: 'improvements', label: '改进建议', type: 'list', editable: true }
];
```

Frontend renders sections dynamically based on this schema. Adding/removing fields only requires editing this file.

### 6.2 Chart Specifications

| Chart | Library | Data Source |
|---|---|---|
| Radar (综合能力) | Recharts RadarChart | OpenDota benchmarks percentiles |
| Line (经济曲线) | Recharts LineChart | Per-minute gold array |
| Bar (伤害/治疗/控制) | Recharts BarChart | Match totals + rank among 10 players |
| Item Timeline | Custom timeline component | Item purchase events |

---

## 7. RAG Knowledge Base Design

### 7.1 Phase 1: Text-Based (Current)

**Directory Structure:**
```
knowledge/
├── text/
│   ├── axe_early_game.md
│   ├── support_warding.md
│   └── ...
└── README.md
```

**Article Format:**
```markdown
---
heroes: ["Axe", "Bristleback"]
topics: ["early_game", "initiation"]
roles: ["offlane"]
source: "NGA"
---

# 斧王前期节奏

斧王必须在 8 分钟前做出跳刀...
```

**Build Process:**
```
npm run build:knowledge
```
Runs `scripts/build-knowledge.js`:
1. Scans `knowledge/text/`
2. Parses frontmatter + content
3. Calls OpenAI Embedding API (`text-embedding-3-small`)
4. Generates `backend/embeddings.json`

**Runtime Retrieval:**
1. Load `embeddings.json` into memory on server start
2. Embed query string via OpenAI API
3. Compute cosine similarity against all knowledge vectors
4. Return top-K most relevant documents

### 7.2 Phase 2: Video Support (Reserved)

**Planned Directory Structure:**
```
knowledge/
├── text/           ← Phase 1
└── video_transcripts/  ← Phase 2 (reserved)
    ├── video_001.md
    └── ...
```

**Planned Pipeline:**
1. Video download / Bilibili/YouTube link input
2. Audio extraction
3. OpenAI Whisper API transcription
4. Auto-generated frontmatter (detected heroes/topics via LLM or manual)
5. Same embedding pipeline as text

**Extensibility:** The `build-knowledge.js` script is designed with a processor pattern:
```js
const processors = {
  text: TextProcessor,
  video_transcript: VideoTranscriptProcessor,  // Phase 2
  // video_direct: VideoDirectProcessor,       // Future Phase 3
};
```

---

## 8. Error Handling & Edge Cases

| Scenario | Backend Response | Frontend Behavior |
|---|---|---|
| OpenDota API rate limit / failure | Retry 3x, then `{ error: "数据服务暂时繁忙，请 30 秒后重试" }` | Show retry button |
| Match ID not found / private | `{ error: "未找到该对局，请检查 ID 是否正确，或确认该对局为公开比赛" }` | Clear input, allow retry |
| Unsupported game mode | `{ error: "暂不支持该对局的分析", supportedModes: ["天梯", "普通匹配"] }` | Show mode requirement hint |
| AI API failure / timeout (OpenDota OK) | Return match data without report | Show raw data panel, AI section shows "分析服务暂时不可用" |
| AI response format invalid | Attempt regex extraction, fallback to `{ error: "解析异常" }` | Show partial data if extractable |
| Match extremely short (< 10 min) | Include note in prompt, AI adapts analysis | Display as normal |
| Match extremely long (> 90 min) | Include note in prompt | Display as normal |
| Player data anomalous (e.g., 0/15/0) | Include full context in prompt, AI judges intent | Display as normal |

---

## 9. LocalStorage Cache Design

```js
// Key: "dota2_analyzer_cache"
{
  "recentMatches": [
    {
      "matchId": "1234567890",
      "analyzedAt": "2026-05-10T14:32:00Z",
      "hero": "Axe",
      "playerSlot": 0,
      "result": "loss",
      "report": { /* Full report with user edits */ },
      "chatHistory": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
      ],
      "modelUsed": "gpt-4o-mini"
    }
  ],
  "settings": {
    "preferredModel": "gpt-4o-mini"
  }
}
```

**Limits:**
- Max 5 recent matches. Oldest auto-evicted on overflow.
- User edits to report fields immediately sync to cache.
- Model preference persisted across sessions.

---

## 10. Deployment

**Platform:** Vercel

**Setup:**
1. Push code to GitHub
2. Import to Vercel project
3. Configure environment variables:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (optional)
4. Deploy

**Frontend:** Static hosting via Vercel CDN
**Backend:** Vercel Serverless Functions (API routes)

**Environment Variables:**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENDOTA_BASE_URL=https://api.opendota.com/api
```

---

## 11. Future Extensibility

| Feature | Phase | Notes |
|---|---|---|
| User login & history | 2 | OAuth (GitHub/Google) + database (PostgreSQL/MongoDB) |
| Mobile responsiveness | 2 | Tailwind responsive utilities |
| Video RAG | 2 | Whisper transcription pipeline |
| Steam ID auto-fetch recent matches | 2 | Allow users to pick from last 20 games |
| Multi-model comparison | 3 | Run same analysis with 2 models side-by-side |
| Community knowledge contributions | 3 | Users submit guides, admin approval workflow |
| Tier benchmarking | 3 | Compare player against Herald/Ancient/Divine averages |

---

## 12. Open Questions / Decisions

1. **Turning point visualization:** Phase 1 shows turning point as text only. Phase 2 may add a timeline marker on the gold curve chart.
2. **Knowledge base initial content:** Developer must manually curate and format the first batch of articles before `build:knowledge` can run.
3. **OpenDota data completeness:** If OpenDota is missing `benchmarks` for a hero/rank combo, radar chart falls back to raw values without comparison line.
