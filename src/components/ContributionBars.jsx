import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ContributionBars({ data }) {
  return (
    <div className="bg-dota-card rounded-lg p-4 border border-gray-800">
      <h4 className="text-white font-semibold mb-2">伤害 / 治疗 / 控制</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
          <Bar dataKey="value" fill="#4b7bec" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
