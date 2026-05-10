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
