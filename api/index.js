import express from 'express';
import cors from 'cors';

import modelsRouter from './routes/models.js';
import matchRouter from './routes/match.js';
import analyzeRouter from './routes/analyze.js';
import chatRouter from './routes/chat.js';
import parseRouter from './routes/parse.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/models', modelsRouter);
app.use('/api/match', matchRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/parse', parseRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  });
});

export default app;
