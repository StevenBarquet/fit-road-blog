'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Config
import style from './PageHeader.module.scss';

interface Props {
  subtitle: string;
}

export function PageHeader({ subtitle }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <header className={style.PageHeader}>
      <span className="brand-icon">🔥</span>
      <div className="brand-text">
        <h1>Fit Road</h1>
        <span className="brand-sub">{subtitle}</span>
      </div>
    </header>
  );
}
