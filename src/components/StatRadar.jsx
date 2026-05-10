import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function StatRadar({ data }) {
  const chartData = [
    { subject: '补刀', A: data.lastHitScore || 60, fullMark: 100 },
    { subject: 'GPM', A: data.gpmScore || 60, fullMark: 100 },
    { subject: '伤害', A: data.damageScore || 60, fullMark: 100 },
    { subject: '生存', A: data.survivalScore || 60, fullMark: 100 },
    { subject: '团队', A: data.teamScore || 60, fullMark: 100 },
  ];

  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">综合能力</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="玩家" dataKey="A" stroke="#ffd700" fill="#ffd700" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
