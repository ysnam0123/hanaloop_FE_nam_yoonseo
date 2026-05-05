'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getTypeColor } from '@/lib/chartColors';

interface DataPoint {
  month: string;
  Scope1: number;
  Scope2: number;
  Scope3: number;
}

export default function ScopeLineChart({ data }: { data: DataPoint[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        Scope 1 vs Scope 2 vs Scope 3 월별 추이
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
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
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
          />
          <Line
            type="monotone"
            dataKey="Scope1"
            name="Scope 1"
            stroke={getTypeColor('Scope1')}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: getTypeColor('Scope1'), strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Scope2"
            name="Scope 2"
            stroke={getTypeColor('Scope2')}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: getTypeColor('Scope2'), strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Scope3"
            name="Scope 3"
            stroke={getTypeColor('Scope3')}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: getTypeColor('Scope3'), strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
