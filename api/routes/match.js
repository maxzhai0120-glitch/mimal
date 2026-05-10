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
