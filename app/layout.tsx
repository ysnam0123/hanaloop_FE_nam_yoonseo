import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/layout/Toast';
import Providers from './providers';
import AppShell from '@/components/layout/AppShell';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CarbonLoop',
  description: '탄소 활동데이터 입력부터 품질 검토, 배출계수 적용, 보고서 작성까지 연결하는 탄소관리 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-gray-50">
        <Providers>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
