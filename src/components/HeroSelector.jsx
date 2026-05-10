export default function HeroSelector({ players, selectedSlot, setSelectedSlot, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">选择要分析的英雄</h3>
      <div className="grid grid-cols-2 gap-3">
        {players.map((p) => (
          <button
            key={p.slot}
            onClick={() => setSelectedSlot(p.slot)}
            className={`p-3 rounded-lg border text-left transition ${
              selectedSlot === p.slot
                ? 'border-dota-gold bg-yellow-500/10'
                : 'border-gray-700 bg-dota-card hover:border-gray-500'
            }`}
          >
            <div className="text-white font-medium">英雄 #{p.hero}</div>
            <div className="text-sm text-gray-400">{p.name}</div>
            <div className="text-sm text-gray-500">KDA: {p.kda}</div>
            <div className={`text-xs mt-1 ${p.team === 'radiant' ? 'text-green-400' : 'text-red-400'}`}>
              {p.team === 'radiant' ? '天辉' : '夜魇'}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onAnalyze}
        disabled={loading || selectedSlot === null}
        className="w-full py-3 bg-dota-gold text-dota-dark font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '正在分析...' : '开始分析'}
      </button>
    </div>
  );
}
