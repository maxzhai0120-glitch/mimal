export function validateMatchId(matchId) {
  const id = String(matchId).trim();
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('对局ID格式不正确，应为纯数字');
  }
  return id;
}

export function validateLobbyType(lobbyType) {
  const supported = [0, 7]; // 0 = public matchmaking, 7 = ranked
  if (!supported.includes(lobbyType)) {
    const error = new Error('暂不支持该对局的分析');
    error.code = 'UNSUPPORTED_MODE';
    error.supportedModes = ['天梯', '普通匹配'];
    throw error;
  }
}

export function validatePlayerSlot(slot) {
  const s = parseInt(slot, 10);
  if (Number.isNaN(s) || s < 0 || s > 9) {
    throw new Error('playerSlot 必须在 0-9 之间');
  }
  return s;
}
