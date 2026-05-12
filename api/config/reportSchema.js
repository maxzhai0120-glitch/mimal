export const reportSchema = [
  { key: 'overview', label: '局势总评', type: 'text', editable: true },
  { key: 'draftAnalysis', label: '阵容分析', type: 'text', editable: true },
  { key: 'laning', label: '对线期分析', type: 'text', editable: true },
  { key: 'midGame', label: '中期分析', type: 'text', editable: true },
  { key: 'lateGame', label: '后期分析', type: 'text', editable: true },
  { key: 'itemBuild', label: '装备评价', type: 'text', editable: true },
  { key: 'skillBuild', label: '技能加点', type: 'text', editable: true },
  { key: 'keyMistakes', label: '关键失误', type: 'list', editable: true },
  { key: 'improvements', label: '改进建议', type: 'list', editable: true },
];

export const reportJsonSchema = {
  type: 'object',
  properties: {
    overview: { type: 'string' },
    draftAnalysis: { type: 'string' },
    laning: { type: 'string' },
    midGame: { type: 'string' },
    lateGame: { type: 'string' },
    itemBuild: { type: 'string' },
    skillBuild: { type: 'string' },
    keyMistakes: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'draftAnalysis', 'laning', 'midGame', 'itemBuild', 'skillBuild', 'keyMistakes', 'improvements'],
};
