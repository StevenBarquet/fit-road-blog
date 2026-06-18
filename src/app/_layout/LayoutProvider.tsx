import { type ReactNode } from 'react';
import { BottomNav } from '../_common/BottomNav/BottomNav';

export function LayoutProvider({ children }: { children: ReactNode }) {
  return (
    <main>
      {children}
      <BottomNav />
    </main>
  );
}
