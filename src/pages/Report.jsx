import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import MatchOverview from '../components/MatchOverview.jsx';
import StatRadar from '../components/StatRadar.jsx';
import GoldCurve from '../components/GoldCurve.jsx';
import ContributionBars from '../components/ContributionBars.jsx';
import ItemTimeline from '../components/ItemTimeline.jsx';
import AIReport from '../components/AIReport.jsx';
import ChatBox from '../components/ChatBox.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { chatFollowUp } from '../services/api.js';

export default function Report() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getMatch, saveMatch, updateMatchReport, updateChatHistory } = useLocalStorage();
  const [match, setMatch] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
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

  async function handleChatSend(content) {
    if (!match) return;
    const newMessages = [...(match.chatHistory || []), { role: 'user', content }];
    const updated = { ...match, chatHistory: newMessages };
    setMatch(updated);
    updateChatHistory(matchId, newMessages);

    setChatLoading(true);
    try {
      const res = await chatFollowUp(
        matchId,
        match.playerSlot,
        match.modelUsed,
        newMessages,
        match.report
      );
      const withReply = [...newMessages, { role: 'assistant', content: res.reply }];
      setMatch((prev) => ({ ...prev, chatHistory: withReply }));
      updateChatHistory(matchId, withReply);
    } catch (err) {
      const withError = [...newMessages, { role: 'assistant', content: '抱歉，出现了错误，请重试。' }];
      setMatch((prev) => ({ ...prev, chatHistory: withError }));
      updateChatHistory(matchId, withError);
    } finally {
      setChatLoading(false);
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
  const goldData = (pd.goldTicks || []).map((g, i) => ({ minute: i, gold: g }));
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <MatchOverview match={match.match || match} />
          <div className="ml-4 shrink-0">
            {match.usedKnowledgeBase ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                已结合知识库
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                纯 GPT 分析
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <StatRadar data={radarData} />
            <GoldCurve data={goldData} />
            <ContributionBars data={contribData} />
            <ItemTimeline items={itemData} />
          </div>
          <div className="space-y-4">
            <AIReport report={match.report} onReportChange={handleReportChange} />
            <ChatBox
              messages={match.chatHistory || []}
              onSend={handleChatSend}
              loading={chatLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
