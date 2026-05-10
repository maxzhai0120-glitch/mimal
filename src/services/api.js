import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function getModels() {
  const res = await api.get('/models');
  return res.data.models;
}

export async function getMatchPlayers(matchId) {
  const res = await api.get(`/match/${matchId}/players`);
  return res.data;
}

export async function analyzeMatch(matchId, playerSlot, model) {
  const res = await api.post('/analyze', { matchId, playerSlot, model });
  return res.data;
}

export async function chatFollowUp(matchId, playerSlot, model, messages, initialReport) {
  const res = await api.post('/chat', { matchId, playerSlot, model, messages, initialReport });
  return res.data;
}

export default api;
