'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { ROLE_LABEL } from '@/types/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('executive');
  const [password, setPassword] = useState('1111');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? '로그인 실패');
      }
      login(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#007A33]">CARBONLOOP</p>
            <h2 className="mt-1 text-lg font-black text-gray-950">로그인</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-gray-600">아이디</span>
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="executive 또는 operator"
              className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-600">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="1111"
              className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>

          {/* <div className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">
            데모 계정: 경영진 <b>executive / 1111</b>, 실무진{' '}
            <b>operator / 1111</b>
          </div> */}

          {error && (
            <p className="text-xs font-semibold text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-xl bg-[#007A33] text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
          {(['executive', 'operator'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setLoginId(role)}
              className="rounded-lg border border-gray-100 px-3 py-2 text-left hover:bg-green-50"
            >
              <span className="block font-bold text-gray-800">
                {ROLE_LABEL[role]}
              </span>
              <span>{role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
