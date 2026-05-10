import { Router } from 'express';
import { getAvailableModels } from '../config/models.config.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ models: getAvailableModels() });
});

export default router;
