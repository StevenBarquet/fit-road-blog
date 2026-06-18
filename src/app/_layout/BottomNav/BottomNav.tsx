'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
// ---Config
import style from './BottomNav.module.scss';

const TABS = [
  { key: '/', label: 'Calendario', icon: 'mdi:calendar-month' },
  { key: '/galeria', label: 'Galeria', icon: 'mdi:image-multiple' },
  { key: '/perfil', label: 'Perfil', icon: 'mdi:account-circle-outline' },
] as const;

export function BottomNav(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const pathname = usePathname();
  const router = useRouter();

  // -----------------------AUX METHODS
  function isActive(key: string): boolean {
    if (key === '/') return pathname === '/';
    return pathname.startsWith(key);
  }

  // -----------------------RENDER
  return (
    <nav className={style.BottomNav}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={isActive(tab.key) ? 'tab active' : 'tab'}
          onClick={() => router.push(tab.key)}
          type="button"
        >
          <Icon icon={tab.icon} width={22} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
