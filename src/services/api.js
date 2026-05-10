import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const serverError = err.response?.data?.error;
    const message = err.message;

    let detail = '';
    if (status === 404) detail = '【错误码 404】未找到该对局，请检查 ID 是否正确，或确认该对局为公开比赛。';
    else if (status === 400) detail = `【错误码 400】${serverError || '请求参数错误'}`;
    else if (status === 500) detail = `【错误码 500】服务器内部错误：${serverError || message}`;
    else if (status === 502) detail = '【错误码 502】网关错误，Vercel 函数超时或崩溃。';
    else if (status === 503) detail = '【错误码 503】服务暂不可用，请稍后重试。';
    else if (err.code === 'ECONNABORTED') detail = '【超时】请求超时（60秒），可能是网络问题或服务器处理时间过长。';
    else if (err.code === 'ERR_NETWORK') detail = '【网络错误】无法连接到服务器，请检查网络。';
    else detail = `【错误码 ${status || '未知'}】${serverError || message}`;

    err.formattedMessage = detail;
    return Promise.reject(err);
  }
);

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
