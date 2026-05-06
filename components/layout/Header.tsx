'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  year: number;
  onYearChange: (year: number) => void;
}

export default function Header({
  title,
  subtitle,
  year,
  onYearChange,
}: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-800">탄소관리 플랫폼</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-500">{title}</span>
        {subtitle && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-gray-500">{subtitle}</span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Year filter */}
        <div className="relative flex items-center">
          <span className="absolute left-2.5 pointer-events-none text-gray-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="pl-8 pr-6 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <span className="absolute right-2 pointer-events-none text-gray-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
}
