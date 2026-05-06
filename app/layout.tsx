import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/layout/Toast';
import Sidebar from '@/components/layout/Sidebar';
import Providers from './providers';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '탄소관리 플랫폼',
  description: 'ESG 탄소 배출량 관리 플랫폼',
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
            <div className="flex h-full overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-auto">
                {children}
              </div>
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
