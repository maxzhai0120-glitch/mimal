import { getHeroName } from '../data/heroNames.js';

export default function HeroSelector({ players, selectedSlot, setSelectedSlot, playerRole, setPlayerRole, onAnalyze, loading }) {
  const radiant = players.filter((p) => p.team === 'radiant');
  const dire = players.filter((p) => p.team === 'dire');

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setPlayerRole(null);
  }

  function isReadyToAnalyze() {
    return selectedSlot !== null && playerRole !== null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">选择要分析的英雄</h3>
      <div className="grid grid-cols-2 gap-3">
        {players.map((p) => (
          <button
            key={p.slot}
            onClick={() => handleSelectSlot(p.slot)}
            className={`p-3 rounded-lg border text-left transition ${
              selectedSlot === p.slot
                ? 'border-dota-gold bg-yellow-500/10'
                : 'border-gray-700 bg-dota-card hover:border-gray-500'
            }`}
          >
            <div className="text-white font-medium">{getHeroName(p.hero)}</div>
            <div className="text-sm text-gray-400">{p.name}</div>
            <div className="text-sm text-gray-500">KDA: {p.kda}</div>
            <div className={`text-xs mt-1 ${p.team === 'radiant' ? 'text-green-400' : 'text-red-400'}`}>
              {p.team === 'radiant' ? '天辉' : '夜魇'}
            </div>
          </button>
        ))}
      </div>

      {selectedSlot !== null && (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
          <div className="text-sm text-gray-300">
            你玩的是 <span className="text-white font-medium">{getHeroName(players.find((p) => p.slot === selectedSlot)?.hero)}</span>，请确认你的角色：
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPlayerRole('core')}
              className={`flex-1 py-3 rounded-lg border font-semibold transition ${
                playerRole === 'core'
                  ? 'border-dota-gold bg-yellow-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              核心位
              <div className="text-xs font-normal mt-1 text-gray-500">1 / 2 / 3号位</div>
            </button>
            <button
              onClick={() => setPlayerRole('support')}
              className={`flex-1 py-3 rounded-lg border font-semibold transition ${
                playerRole === 'support'
                  ? 'border-dota-gold bg-yellow-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              辅助位
              <div className="text-xs font-normal mt-1 text-gray-500">4 / 5号位</div>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={loading || !isReadyToAnalyze()}
        className="w-full py-3 bg-dota-gold text-dota-dark font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '正在分析...' : '开始分析'}
      </button>
    </div>
  );
}
