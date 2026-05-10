import { getHeroName } from '../data/heroNames.js';

const OPENDOTA_BASE_URL = process.env.OPENDOTA_BASE_URL || 'https://api.opendota.com/api';

export async function fetchMatch(matchId) {
  const res = await fetch(`${OPENDOTA_BASE_URL}/matches/${matchId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('未找到该对局，请检查 ID 是否正确，或确认该对局为公开比赛');
    throw new Error(`OpenDota API error: ${res.status}`);
  }
  return res.json();
}

export function extractPlayerList(matchData) {
  if (!matchData.players) return [];
  return matchData.players.map((p) => ({
    slot: p.player_slot,
    hero: p.hero_id,
    heroName: getHeroName(p.hero_id),
    name: p.personaname || `玩家 ${p.player_slot}`,
    kda: `${p.kills}/${p.deaths}/${p.assists}`,
    team: p.player_slot < 5 ? 'radiant' : 'dire',
  }));
}

export function extractPlayerDetail(matchData, playerSlot) {
  const p = matchData.players?.find((pl) => pl.player_slot === playerSlot);
  if (!p) throw new Error('未找到该玩家数据');

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
    obsPlaced: p.obs_placed || 0,
    senPlaced: p.sen_placed || 0,
    lane: p.lane,
    laneRole: p.lane_role,
    isRadiant: p.isRadiant,
    win: p.win,
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
