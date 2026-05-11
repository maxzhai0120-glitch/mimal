# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DOTA2 Match Analyzer — a full-stack web app where players input a match ID, select one of 10 heroes, and receive an AI-generated structured analysis report with data visualizations. Deployed on Vercel.

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express (Vercel Serverless Functions)
- **Data source**: OpenDota API
- **AI**: OpenAI GPT-4o-mini (primary), Anthropic Claude (optional)
- **RAG**: text-embedding-3-small + cosine similarity on local JSON embeddings
- **Storage**: No database; localStorage caches recent 5 matches + user edits + chat history + model preference

## Common Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Build knowledge base embeddings (requires OPENAI_API_KEY in .env)
npm run build:knowledge
```

## Architecture

### Frontend (`src/`)

- **SPA routing** via `src/router.jsx`: `/` (Home) and `/report/:matchId` (Report)
- **State management**: React hooks only; `useLocalStorage.js` syncs match cache and settings to localStorage
- **API client**: `src/services/api.js` (axios with interceptors for Chinese error messages)
- **Data flow**: Home fetches match → selects player slot → analyzes → navigates to Report with `state: { matchRecord }` AND saves to localStorage. Report reads `location.state` first, falls back to `getMatch(matchId)`
- **Charts**: Recharts (StatRadar, GoldCurve, ContributionBars, ItemTimeline)
- **Chat**: ChatBox component receives `messages` array and `onSend` callback; Report's `handleChatSend` optimistically updates state, calls API, appends reply

### Backend (`api/`)

- **Entry**: `api/index.js` — Express app with CORS and JSON body parser (limit 10mb)
- **Routing**: All API routes mounted under `/api/*`. `vercel.json` rewrites `/api/(.*)` to `/api/index.js`
- **Services**:
  - `opendota.js`: Fetches match data, extracts player list / player detail / match summary
  - `ai.js`: Builds prompts and calls OpenAI/Anthropic APIs. Prompt logging controlled by `DEBUG_AI=true` env var
  - `rag.js`: Loads `knowledge/embeddings.json`, generates query embedding, returns top-K docs by cosine similarity
- **Models**: Configured in `api/config/models.config.js`. Only models with configured API keys are exposed to frontend
- **Validation**: `api/utils/validators.js` validates match IDs, player slots, and lobby types (only ranked=7 and normal=0 are supported)

### Vercel Deployment

- `vercel.json` uses `rewrites` (not `routes`) with `outputDirectory: "dist"`
- All non-API paths fall back to `index.html` for SPA routing
- Push to GitHub `main` branch triggers auto-deploy
- Environment variables configured in Vercel dashboard (not in repo)

## Key Data Flows

**Match Analysis** (`/api/analyze`):
1. Fetch full match from OpenDota
2. Validate lobby type
3. Extract player detail + match summary
4. Retrieve relevant RAG docs (wrapped in try-catch; failure falls back to pure GPT)
5. Call AI with match data + RAG context
6. Parse AI JSON response (with regex fallback for malformed JSON)
7. Return `{ match, playerData, report, modelUsed, ragDocsUsed, usedKnowledgeBase }`

**Chat Follow-up** (`/api/chat`):
1. Fetch match data again (stateless; no session storage)
2. Build message history from `req.body.messages`
3. Call AI with system prompt + match context + chat history
4. Return `{ reply, modelUsed }`

## Environment Variables

Copy `.env.example` to `.env` for local development:
- `OPENAI_API_KEY` — required for analysis, chat, and knowledge base embeddings
- `ANTHROPIC_API_KEY` — optional; enables Claude model switch
- `OPENDOTA_BASE_URL` — defaults to `https://api.opendota.com/api`
- `DEBUG_AI` — set to `true` to log all prompts and AI responses to server console (visible in Vercel logs)

## Important Notes

- **No persistent server-side storage**: Vercel functions are stateless. The `knowledge/embeddings.json` file is built at deploy time and read at runtime. Do not attempt to write files in production.
- **localStorage is the source of truth for client state**: `useLocalStorage` normalizes `matchId` to string for comparison. Updates to report/chat are written to localStorage immediately.
- **Report page initialization guard**: `Report.jsx` uses `initializedMatchId` ref to prevent `useEffect` from re-running when `getMatch` reference changes (which happens on every localStorage update).
- **Router wrapper**: `router.jsx` uses `ReportWrapper` with `key={matchId}` to force remount when switching between reports.
- **Error boundary**: `ErrorBoundary` wraps Report's main content to prevent rendering crashes from taking down the entire page.
- **Hero/item names**: Chinese name mappings are in `src/data/heroNames.js` and `src/data/itemNames.js` (manual maintenance).
