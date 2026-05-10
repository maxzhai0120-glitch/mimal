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
