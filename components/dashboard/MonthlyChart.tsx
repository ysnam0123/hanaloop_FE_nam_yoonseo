'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getTypeColor } from '@/lib/chartColors';

interface DataPoint {
  month: string;
  [type: string]: string | number;
}

export default function MonthlyChart({ data }: { data: DataPoint[] }) {
  const typeKeys = Array.from(
    new Set(
      data.flatMap((item) => Object.keys(item).filter((key) => key !== 'month')),
    ),
  );
  const avg =
    data.length > 0
      ? data.reduce((sum, d) => {
          const monthTotal = typeKeys.reduce(
            (monthSum, key) => monthSum + Number(d[key] ?? 0),
            0,
          );
          return sum + monthTotal;
        }, 0) / data.length
      : 0;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        월별 총 배출량
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 100, left: 0, bottom: 0 }}
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
            width={44}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toFixed(1)} kgCO₂e`,
              String(name),
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          />
          <Legend
            align="right"
            verticalAlign="top"
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
          />
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="#9CA3AF"
              strokeDasharray="4 4"
              label={{
                value: `월 평균 ${Math.round(avg).toLocaleString()} kgCO₂e`,
                position: 'right',
                fill: '#9CA3AF',
                fontSize: 11,
              }}
            />
          )}
          {typeKeys.map((type, index) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="s"
              fill={getTypeColor(type)}
              radius={index === typeKeys.length - 1 ? [3, 3, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
