'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = { 전기: '#0EA5E9', 원소재: '#8B5CF6', 운송: '#F97316' };

const MOCK_DATA = [
  { month: '2025-02', 전기: 5840, 원소재: 4720, 운송: 1980 },
  { month: '2025-03', 전기: 6210, 원소재: 5100, 운송: 2150 },
  { month: '2025-04', 전기: 5970, 원소재: 4860, 운송: 2080 },
  { month: '2025-05', 전기: 6380, 원소재: 5320, 운송: 2240 },
  { month: '2025-06', 전기: 6620, 원소재: 5480, 운송: 2310 },
  { month: '2025-07', 전기: 6880, 원소재: 5610, 운송: 2390 },
];

export default function PeriodChart() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        기간별 배출량
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={MOCK_DATA}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F3F4F6"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(v: string) => `${parseInt(v.split('-')[1])}월`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(v, n) => [`${Number(v).toFixed(1)} kgCO₂e`, String(n)]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
            }}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          />
          <Bar dataKey="전기" stackId="s" fill={COLORS.전기} />
          <Bar dataKey="원소재" stackId="s" fill={COLORS.원소재} />
          <Bar
            dataKey="운송"
            stackId="s"
            fill={COLORS.운송}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
