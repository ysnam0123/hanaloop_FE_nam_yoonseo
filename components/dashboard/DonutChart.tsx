'use client';

import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { getTypeColor } from '@/lib/chartColors';

interface DataPoint {
  type: string;
  value: number;
}

export default function DonutChart({ data }: { data: DataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">유형별 비중</h3>
      <div className="flex items-center justify-center gap-8 flex-1">
        {/* Donut */}
        <div className="relative shrink-0">
          <PieChart width={180} height={180}>
            <Pie
              data={data}
              cx={90}
              cy={90}
              innerRadius={58}
              outerRadius={84}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={getTypeColor(entry.type)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(1)} kgCO₂e`,
                `scope ${String(name)}`,
              ]}
              contentStyle={{
                fontSize: 15,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              wrapperStyle={{ zIndex: 1000 }}
            />
          </PieChart>
          {/* Center label */}
          <div className="absolute  inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[13px] text-gray-400 leading-none font-semibold">
              Total
            </span>
            <span className="text-xl font-bold text-gray-800 mt-0.5 leading-none">
              {Math.round(total).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {data.map((entry) => {
            const ratio = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <div key={entry.type} className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getTypeColor(entry.type) }}
                />
                <div>
                  <p className="text-xs text-gray-500">{entry.type}</p>
                  <p className="text-sm font-bold text-gray-800">
                    {ratio.toFixed(0)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
