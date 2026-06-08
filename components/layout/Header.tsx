'use client';

import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { ROLE_LABEL } from '@/types/auth';

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
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="h-18 bg-[#F7FCF3] border-b border-green-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex min-w-0 items-center gap-4">
        <div className="text-[28px] font-black text-[#006B2B] whitespace-nowrap">
          CarbonLoop
        </div>
        <span className="h-7 w-px bg-green-200" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <span className="absolute left-3 pointer-events-none text-gray-500">
            <svg
              width="15"
              height="15"
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
            className="h-9 rounded-xl border border-green-100 bg-white/70 pl-9 pr-8 text-sm font-semibold text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <span className="absolute right-3 pointer-events-none text-gray-400">
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

        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-black text-gray-800">{user.name}</p>
              <p className="text-[11px] font-semibold text-[#007A33]">
                {ROLE_LABEL[user.role]}
              </p>
            </div>
            <button
              type="button"
              title="로그아웃"
              onClick={logout}
              className="h-9 w-9 rounded-full bg-[#006B2B] text-white flex items-center justify-center text-xs font-bold"
            >
              {user.name.slice(0, 1)}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="h-9 rounded-xl bg-[#006B2B] px-4 text-sm font-bold text-white hover:bg-green-700"
          >
            로그인
          </button>
        )}
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
