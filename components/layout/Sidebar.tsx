'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  {
    label: '개요',
    href: '/dashboard',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: '데이터',
    href: '/activities',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    label: '계수',
    href: '/factors',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    ),
  },
  {
    label: '보고서',
    href: '/reports',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5V4a2 2 0 0 1 2-2h9l5 5v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
];

interface Props {
  onGoalSettings: () => void;
}

function GoalIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
}

export default function Sidebar({ onGoalSettings }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const canManageGoals = user?.role === 'executive';

  return (
    <aside className="w-[72px] min-h-screen bg-[#0B1A2A] text-slate-300 flex flex-col shrink-0">
      <div className="h-18 flex flex-col items-center justify-center gap-1 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-[#6EF28C] text-[#073B20] flex items-center justify-center shadow-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 4c-7.2.5-12.2 4-14.3 9.1-1.1 2.7-.8 5.2.6 6.6 1.4 1.4 3.9 1.7 6.6.6C18 18.2 21.5 13.2 20 4Z" />
            <path d="M7.5 17.5 15 10" />
          </svg>
        </div>
        <span className="text-[10px] font-black leading-none text-[#6EF28C]">
          HANA
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative mx-2 flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors ${
                active
                  ? 'bg-white/10 text-[#6EF28C]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute left-[-8px] top-2 h-10 w-1 rounded-r-full bg-[#6EF28C]" />
              )}
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        {canManageGoals && (
          <button
            type="button"
            onClick={onGoalSettings}
            title="목표설정"
            className="relative mx-2 flex h-14 w-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span>
              <GoalIcon />
            </span>
            목표설정
          </button>
        )}
      </nav>

      <div className="py-4 border-t border-white/10 space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-[#0B1A2A]">
          ESG
        </div>
      </div>
    </aside>
  );
}
