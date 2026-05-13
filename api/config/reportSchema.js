export const reportSchema = [
  { key: 'overview', label: '局势总评', type: 'text', editable: true },
  { key: 'draftAnalysis', label: '阵容分析', type: 'text', editable: true },
  { key: 'earlyGame', label: '前期分析', type: 'text', editable: true },
  { key: 'midGame', label: '中期分析', type: 'text', editable: true },
  { key: 'lateGame', label: '后期分析', type: 'text', editable: true },
  { key: 'itemAndSkill', label: '装备与技能选择', type: 'text', editable: true },
  { key: 'improvements', label: '改进建议', type: 'list', editable: true },
];

export const reportJsonSchema = {
  type: 'object',
  properties: {
    overview: { type: 'string' },
    draftAnalysis: { type: 'string' },
    earlyGame: { type: 'string' },
    midGame: { type: 'string' },
    lateGame: { type: 'string' },
    itemAndSkill: { type: 'string' },
    improvements: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'draftAnalysis', 'earlyGame', 'midGame', 'itemAndSkill', 'improvements'],
};
