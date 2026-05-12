import dotenv from 'dotenv';
import { fetchMatch, extractPlayerList, extractPlayerDetail, extractMatchSummary } from '../api/services/opendota.js';
import { analyzeMatch } from '../api/services/ai.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const MATCH_ID = '8804140289';
const PLAYER_SLOT = 0;

async function main() {
  console.log(`Fetching match ${MATCH_ID}...`);
  const matchData = await fetchMatch(MATCH_ID);

  console.log('Players in this match:');
  const players = extractPlayerList(matchData);
  players.forEach((p) => console.log(`  Slot ${p.slot}: ${p.heroName} (${p.name}) - ${p.kda}`));

  const playerData = extractPlayerDetail(matchData, PLAYER_SLOT);
  const matchSummary = extractMatchSummary(matchData, PLAYER_SLOT);

  const models = ['gpt-4o', 'gpt-5.4-mini'];
  const results = {};

  for (const modelId of models) {
    console.log(`\nAnalyzing with ${modelId}...`);
    try {
      const start = Date.now();
      const result = await analyzeMatch({
        matchData,
        playerData,
        matchSummary,
        ragDocs: [],
        modelId,
      });
      const elapsed = Date.now() - start;
      results[modelId] = {
        raw: result.raw,
        modelUsed: result.modelUsed,
        elapsedMs: elapsed,
        parsed: tryParseJson(result.raw),
      };
      console.log(`  Done in ${elapsed}ms`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      results[modelId] = { error: err.message };
    }
  }

  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `compare-${MATCH_ID}-slot${PLAYER_SLOT}.json`);
  await fs.writeFile(
    outputPath,
    JSON.stringify({ matchId: MATCH_ID, playerSlot: PLAYER_SLOT, players, results }, null, 2)
  );

  console.log(`\nResults saved to ${outputPath}`);
}

function tryParseJson(raw) {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

main().catch(console.error);
