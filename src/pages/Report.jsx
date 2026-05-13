import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import MatchOverview from '../components/MatchOverview.jsx';
import StatRadar from '../components/StatRadar.jsx';
import GoldCurve from '../components/GoldCurve.jsx';
import ContributionBars from '../components/ContributionBars.jsx';
import ItemTimeline from '../components/ItemTimeline.jsx';
import AIReport from '../components/AIReport.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { requestParse } from '../services/api.js';
// import { chatFollowUp } from '../services/api.js'; // Phase 2: AI coach chat

export default function Report() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getMatch, saveMatch, updateMatchReport } = useLocalStorage();
  const [match, setMatch] = useState(null);
  const [parseStatus, setParseStatus] = useState('idle'); // idle | submitting | submitted
  const initializedMatchId = useRef(null);

  useEffect(() => {
    if (initializedMatchId.current === matchId) return;
    initializedMatchId.current = matchId;

    const stateMatch = location.state?.matchRecord;
    if (stateMatch) {
      setMatch(stateMatch);
      saveMatch(stateMatch);
      window.history.replaceState({}, document.title);
      return;
    }
    const cached = getMatch(matchId);
    if (cached) {
      setMatch(cached);
    } else {
      navigate('/');
    }
  }, [matchId, getMatch, saveMatch, navigate, location.state]);

  async function handleReportChange(newReport) {
    const updated = { ...match, report: newReport };
    setMatch(updated);
    updateMatchReport(matchId, newReport);
  }

  async function handleRequestParse() {
    if (parseStatus !== 'idle') return;
    setParseStatus('submitting');
    try {
      await requestParse(matchId);
      setParseStatus('submitted');
    } catch (err) {
      alert(err.formattedMessage || '请求解析失败');
      setParseStatus('idle');
    }
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        正在跳转首页...
      </div>
    );
  }

  const pd = match.playerData || {};
  const isMissingMinuteData = !pd.lhTicks || pd.lhTicks.length === 0;
  const goldData = pd.goldTicks || [];
  const contribData = [
    { name: '伤害', value: pd.heroDamage || 0 },
    { name: '治疗', value: pd.heroHealing || 0 },
    { name: '控制', value: pd.stunDuration || 0 },
  ];
  const itemData = (pd.purchases || []).map((p) => ({
    time: `${Math.floor(p.time / 60)}:${String(p.time % 60).padStart(2, '0')}`,
    itemId: p.key,
  }));

  const durationMin = match.match?.durationMin || 1;
  const radarData = {
    lastHitScore: Math.min(Math.round(((pd.lastHits || 0) / durationMin) * 2.5), 100),
    gpmScore: Math.min(Math.round((pd.gpm || 0) / 6), 100),
    damageScore: Math.min(Math.round(((pd.heroDamage || 0) / durationMin) / 20), 100),
    survivalScore: Math.max(0, Math.min(100, 100 - (pd.kda?.deaths || 0) * 5)),
    teamScore: Math.min(Math.round(((pd.obsPlaced || 0) * 8 + (pd.senPlaced || 0) * 5 + (pd.kda?.assists || 0) * 3)), 100),
  };

  const overviewData = match.match || match;
  const overviewPlayerData = match.playerData;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition"
            >
              ← 回到首页
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 bg-dota-gold hover:bg-yellow-400 text-dota-dark text-sm font-bold rounded-lg transition"
            >
              再次分析
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <MatchOverview match={overviewData} playerData={overviewPlayerData} />
          <div className="ml-4 shrink-0 flex items-center gap-2">
            {match.usedKnowledgeBase ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                已结合知识库
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                纯 GPT 分析
              </span>
            )}
            {isMissingMinuteData && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/60 text-yellow-300 border border-yellow-700">
                  缺少分钟级数据
                </span>
                <button
                  onClick={handleRequestParse}
                  disabled={parseStatus !== 'idle'}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    parseStatus === 'submitted'
                      ? 'bg-green-900 text-green-300 border border-green-700 cursor-default'
                      : parseStatus === 'submitting'
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : 'bg-dota-gold hover:bg-yellow-400 text-dota-dark'
                  }`}
                >
                  {parseStatus === 'submitted'
                    ? '✓ 已提交解析'
                    : parseStatus === 'submitting'
                      ? '提交中...'
                      : '请求 OpenDota 解析'}
                </button>
              </div>
            )}
          </div>
        </div>
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <StatRadar data={radarData} />
              <GoldCurve data={goldData} />
              <ContributionBars data={contribData} />
              <ItemTimeline items={itemData} />
            </div>
            <div className="space-y-4">
              <AIReport report={match.report} onReportChange={handleReportChange} />
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
