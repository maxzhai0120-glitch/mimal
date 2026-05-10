import { useState } from 'react';

export default function AIReport({ report, onReportChange }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!report) return null;

  const sections = [
    { key: 'overview', label: '局势总评', type: 'text' },
    { key: 'turningPoint', label: '局势转折点', type: 'text' },
    { key: 'draftAnalysis', label: '阵容分析', type: 'text' },
    { key: 'laning', label: '对线期分析', type: 'text' },
    { key: 'midGame', label: '中期分析', type: 'text' },
    { key: 'lateGame', label: '后期分析', type: 'text' },
    { key: 'itemBuild', label: '装备评价', type: 'text' },
    { key: 'skillBuild', label: '技能加点', type: 'text' },
    { key: 'keyMistakes', label: '关键失误', type: 'list' },
    { key: 'improvements', label: '改进建议', type: 'list' },
  ];

  function startEdit(key, value) {
    setEditingKey(key);
    setEditValue(Array.isArray(value) ? value.join('\n') : value);
  }

  function saveEdit(key) {
    const newReport = { ...report };
    const section = sections.find((s) => s.key === key);
    if (section.type === 'list') {
      newReport[key] = editValue.split('\n').filter((l) => l.trim());
    } else {
      newReport[key] = editValue;
    }
    onReportChange(newReport);
    setEditingKey(null);
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const value = report[section.key];
        const isEditing = editingKey === section.key;

        return (
          <div key={section.key} className="bg-dota-card rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-dota-gold font-semibold">{section.label}</h4>
              {isEditing ? (
                <div className="space-x-2">
                  <button onClick={() => saveEdit(section.key)} className="text-sm text-green-400 hover:text-green-300">保存</button>
                  <button onClick={() => setEditingKey(null)} className="text-sm text-gray-400 hover:text-gray-300">取消</button>
                </div>
              ) : (
                <button onClick={() => startEdit(section.key, value)} className="text-sm text-gray-500 hover:text-gray-300">编辑</button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-200 text-sm focus:outline-none focus:border-dota-gold"
                rows={section.type === 'list' ? 5 : 3}
              />
            ) : (
              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                {section.type === 'list' ? (
                  <ul className="list-disc list-inside space-y-1">
                    {(Array.isArray(value) ? value : []).map((item, idx) => (
                      <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : (
                  (typeof value === 'string' ? value : JSON.stringify(value)) || '无'
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
