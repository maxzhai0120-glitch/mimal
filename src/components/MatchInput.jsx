export default function MatchInput({ matchId, setMatchId, model, setModel, models, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">对局 ID</label>
        <input
          type="text"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="输入对局 ID（如 1234567890）"
          className="w-full px-4 py-3 bg-dota-card border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-dota-gold"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">AI 模型</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 bg-dota-card border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dota-gold"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onSubmit}
        disabled={loading || !matchId.trim()}
        className="w-full py-3 bg-dota-gold text-dota-dark font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '加载中...' : '获取玩家列表'}
      </button>
    </div>
  );
}
