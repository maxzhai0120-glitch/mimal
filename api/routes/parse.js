import { Router } from 'express';
import { requestParse } from '../services/opendota.js';
import { validateMatchId } from '../utils/validators.js';

const router = Router();

router.post('/:matchId', async (req, res, next) => {
  try {
    const matchId = validateMatchId(req.params.matchId);
    const result = await requestParse(matchId);
    res.json({ matchId, status: 'submitted', detail: result });
  } catch (err) {
    next(err);
  }
});

export default router;
