'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import GoalSettingsModal from '@/components/goals/GoalSettingsModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar onGoalSettings={() => setGoalOpen(true)} />
      <div className="flex-1 flex flex-col overflow-auto print:block print:overflow-visible">
        {children}
      </div>
      <div className="print:hidden">
        <GoalSettingsModal
          isOpen={goalOpen}
          onClose={() => setGoalOpen(false)}
        />
      </div>
    </div>
  );
}
