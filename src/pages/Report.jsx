import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  const { getMatch, updateMatchReport, updateChatHistory } = useLocalStorage();
  const [match, setMatch] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const cached = getMatch(matchId);
    if (cached) {
      setMatch(cached);
    } else {
      navigate('/');
    }
  }, [matchId, getMatch, navigate]);

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

  const goldData = match.report?.goldTicks?.map((g, i) => ({ minute: i, gold: g })) || [];
  const contribData = [
    { name: '伤害', value: match.report?.heroDamage || 0 },
    { name: '治疗', value: match.report?.heroHealing || 0 },
    { name: '控制', value: match.report?.stunDuration || 0 },
  ];
  const itemData = (match.report?.purchases || []).map((p) => ({
    time: `${Math.floor(p.time / 60)}:${String(p.time % 60).padStart(2, '0')}`,
    itemId: p.key,
  }));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <MatchOverview match={match.match || match} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <StatRadar data={match.report || {}} />
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
