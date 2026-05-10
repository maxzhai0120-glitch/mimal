import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchInput from '../components/MatchInput.jsx';
import HeroSelector from '../components/HeroSelector.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { getModels, getMatchPlayers, analyzeMatch } from '../services/api.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getHeroName } from '../data/heroNames.js';

export default function Home() {
  const navigate = useNavigate();
  const { recentMatches, preferredModel, setPreferredModel, saveMatch } = useLocalStorage();

  const [matchId, setMatchId] = useState('');
  const [model, setModel] = useState(preferredModel);
  const [models, setModels] = useState([]);
  const [players, setPlayers] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const analyzeSteps = ['正在获取对局数据...', '正在检索知识库...', '正在生成分析报告...'];

  useEffect(() => {
    getModels().then(setModels).catch(console.error);
  }, []);

  useEffect(() => {
    setPreferredModel(model);
  }, [model, setPreferredModel]);

  async function handleFetchPlayers() {
    setError('');
    setLoading(true);
    try {
      const data = await getMatchPlayers(matchId);
      setPlayers(data.players);
      setSelectedSlot(null);
    } catch (err) {
      const detail = err.formattedMessage || err.response?.data?.error || err.message;
      setError(detail);
      window.alert(`获取对局数据失败\n\n${detail}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setError('');
    setLoading(true);
    setAnalyzeStep(0);
    try {
      setAnalyzeStep(1);
      const data = await analyzeMatch(matchId, selectedSlot, model);
      setAnalyzeStep(2);

      const matchRecord = {
        matchId,
        analyzedAt: new Date().toISOString(),
        match: data.match,
        hero: data.match.hero,
        playerSlot: selectedSlot,
        result: data.match.result,
        report: data.report,
        chatHistory: [],
        modelUsed: data.modelUsed,
        usedKnowledgeBase: data.usedKnowledgeBase,
      };
      saveMatch(matchRecord);
      navigate(`/report/${matchId}`);
    } catch (err) {
      const detail = err.formattedMessage || err.response?.data?.error || err.message;
      setError(detail);
      window.alert(`分析失败\n\n${detail}\n\n请检查对局ID、网络连接，或稍后重试。`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-dota-gold mb-2">DOTA2 Match Analyzer</h1>
          <p className="text-gray-400">你的私人 DOTA2 教练</p>
        </div>

        <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
          <MatchInput
            matchId={matchId}
            setMatchId={setMatchId}
            model={model}
            setModel={setModel}
            models={models}
            onSubmit={handleFetchPlayers}
            loading={loading && !players}
          />
        </div>

        {players && !loading && (
          <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
            <HeroSelector
              players={players}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              onAnalyze={handleAnalyze}
              loading={loading && !!players}
            />
          </div>
        )}

        {loading && players && (
          <LoadingScreen steps={analyzeSteps} currentStep={analyzeStep} />
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {recentMatches.length > 0 && (
          <div className="bg-dota-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">最近分析</h3>
            <div className="space-y-2">
              {recentMatches.map((m) => (
                <button
                  key={m.matchId}
                  onClick={() => navigate(`/report/${m.matchId}`)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                >
                  <div className="text-white">对局 {m.matchId}</div>
                  <div className="text-sm text-gray-400">
                    {getHeroName(m.hero)} · {m.result === 'win' ? '胜' : '负'} · {new Date(m.analyzedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
