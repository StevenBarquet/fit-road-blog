import { type ReactNode } from 'react';

export function LayoutProvider({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
