import { getHeroName } from '../data/heroNames.js';
import { inferPosition, POSITION_NAMES } from '../data/heroPositions.js';

const OPENDOTA_BASE_URL = process.env.OPENDOTA_BASE_URL || 'https://api.opendota.com/api';

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return res;

      if (res.status === 404) {
        throw new Error('未找到该对局，请检查 ID 是否正确，或确认该对局为公开比赛');
      }
      if (res.status === 522) {
        if (i < retries) {
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
          continue;
        }
        throw new Error('OpenDota 服务暂时不可用（522），请稍后重试');
      }
      throw new Error(`OpenDota API 错误：${res.status}`);
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        if (i < retries) {
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
          continue;
        }
        throw new Error('连接 OpenDota 超时，请检查网络或稍后重试');
      }
      if (i >= retries) throw err;
    }
  }
}

export async function fetchMatch(matchId) {
  const res = await fetchWithRetry(`${OPENDOTA_BASE_URL}/matches/${matchId}`);
  return res.json();
}

export function extractPlayerList(matchData) {
  if (!matchData.players) return [];

  const radiantPlayers = matchData.players.filter((p) => p.player_slot < 128);
  const direPlayers = matchData.players.filter((p) => p.player_slot >= 128);

  return matchData.players.map((p) => {
    const teamList = p.player_slot < 128 ? radiantPlayers : direPlayers;
    const inferred = inferPosition(p.hero_id, {
      gpm: p.gold_per_min,
      obsPlaced: p.obs_placed || 0,
      senPlaced: p.sen_placed || 0,
      teamPlayers: teamList.map((tp) => ({
        hero_id: tp.hero_id,
        gold_per_min: tp.gold_per_min,
        obs_placed: tp.obs_placed || 0,
        sen_placed: tp.sen_placed || 0,
      })),
    });

    return {
      slot: p.player_slot,
      hero: p.hero_id,
      heroName: getHeroName(p.hero_id),
      name: p.personaname || `玩家 ${p.player_slot}`,
      kda: `${p.kills}/${p.deaths}/${p.assists}`,
      team: p.player_slot < 5 ? 'radiant' : 'dire',
      inferredPosition: inferred.position,
      inferredPositionName: POSITION_NAMES[inferred.position],
      positionConfidence: inferred.confidence,
    };
  });
}

export function extractPlayerDetail(matchData, playerSlot, playerRole = null) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  if (!p) throw new Error('未找到该玩家数据');

  // 推断位置
  const teamSlots = p.player_slot < 128 ? [0, 1, 2, 3, 4] : [128, 129, 130, 131, 132];
  const teamPlayers = matchData.players
    ?.filter((pl) => teamSlots.includes(pl.player_slot))
    .map((pl) => ({
      hero_id: pl.hero_id,
      gold_per_min: pl.gold_per_min,
      obs_placed: pl.obs_placed || 0,
      sen_placed: pl.sen_placed || 0,
    })) || [];

  const inferred = inferPosition(p.hero_id, {
    gpm: p.gold_per_min,
    obsPlaced: p.obs_placed || 0,
    senPlaced: p.sen_placed || 0,
    teamPlayers,
    playerRole,
    playerRaw: p,
  });

  return {
    slot: p.player_slot,
    hero: p.hero_id,
    name: p.personaname || `玩家 ${p.player_slot}`,
    level: p.level,
    kda: { kills: p.kills, deaths: p.deaths, assists: p.assists },
    gpm: p.gold_per_min,
    xpm: p.xp_per_min,
    lastHits: p.last_hits,
    denies: p.denies,
    heroDamage: p.hero_damage,
    towerDamage: p.tower_damage,
    heroHealing: p.hero_healing,
    gold: p.gold,
    items: [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5].map((id, idx) => ({ slot: idx, itemId: id })),
    backpack: [p.backpack_0, p.backpack_1, p.backpack_2].map((id, idx) => ({ slot: idx, itemId: id })),
    abilityUpgrades: p.ability_upgrades_arr || [],
    purchases: p.purchase_log || [],
    goldTicks: p.gold_t?.map((g, i) => ({ minute: i, gold: g })) || [],
    lhTicks: p.lh_t?.map((lh, i) => ({ minute: i, lh })) || [],
    denyTicks: p.dn_t?.map((dn, i) => ({ minute: i, dn })) || [],
    xpTicks: p.xp_t?.map((xp, i) => ({ minute: i, xp })) || [],
    laneEfficiency: p.lane_efficiency,
    laneEfficiencyPct: p.lane_efficiency_pct,
    obsPlaced: p.obs_placed || 0,
    senPlaced: p.sen_placed || 0,
    stunDuration: p.stuns || 0,
    lane: p.lane,
    laneRole: p.lane_role,
    isRadiant: p.isRadiant,
    win: p.win,
    inferredPosition: inferred.position,
    inferredPositionName: POSITION_NAMES[inferred.position],
    positionConfidence: inferred.confidence,
  };
}

export function extractMatchSummary(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  const durationMin = Math.floor((matchData.duration || 0) / 60);
  return {
    matchId: matchData.match_id,
    duration: matchData.duration,
    durationMin,
    lobbyType: matchData.lobby_type,
    gameMode: matchData.game_mode,
    radiantWin: matchData.radiant_win,
    playerSlot,
    hero: p?.hero_id,
    heroName: getHeroName(p?.hero_id),
    level: p?.level,
    kda: `${p?.kills}/${p?.deaths}/${p?.assists}`,
    gpm: p?.gold_per_min,
    result: p?.win ? 'win' : 'loss',
  };
}

export async function requestParse(matchId) {
  const res = await fetchWithRetry(`${OPENDOTA_BASE_URL}/request/${matchId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
