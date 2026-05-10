import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GoldCurve({ data }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">经济曲线</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="minute" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
          <Line type="monotone" dataKey="gold" stroke="#ffd700" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
