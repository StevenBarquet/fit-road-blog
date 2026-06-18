import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav/BottomNav';

export function LayoutProvider({ children }: { children: ReactNode }) {
  return (
    <main>
      {children}
      <BottomNav />
    </main>
  );
}
