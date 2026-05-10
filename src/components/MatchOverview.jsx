export default function MatchOverview({ match }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-white">对局 {match.matchId}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${match.result === 'win' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {match.result === 'win' ? '胜利' : '失败'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-gray-400 text-sm">时长</div>
          <div className="text-white font-semibold">{Math.floor(match.duration / 60)}:{String(match.duration % 60).padStart(2, '0')}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">英雄</div>
          <div className="text-white font-semibold">#{match.player?.hero || match.hero}</div>
        </div>
        <div>
          <div className="text-gray-400 text-sm">KDA</div>
          <div className="text-white font-semibold">{match.player?.kda?.kills ?? '-'}/{match.player?.kda?.deaths ?? '-'}/{match.player?.kda?.assists ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}
