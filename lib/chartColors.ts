const PALETTE = [
  '#0EA5E9',
  '#8B5CF6',
  '#F97316',
  '#10B981',
  '#EF4444',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
  '#84CC16',
];

const EXPLICIT: Record<string, string> = {
  전기: '#0EA5E9',
  원소재: '#8B5CF6',
  운송: '#F97316',
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getTypeColor(type: string): string {
  if (EXPLICIT[type]) return EXPLICIT[type];
  return PALETTE[hash(type) % PALETTE.length];
}
