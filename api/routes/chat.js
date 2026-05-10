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
