'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Icon } from '@iconify/react';
// ---Config
import style from './GaleriaHome.module.scss';

export function GaleriaHome(): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaHome}>
      <header>
        <div className="brand">
          <span className="brand-icon">🔥</span>
          <div className="brand-text">
            <h1>Fit Road</h1>
            <span className="brand-sub">galería</span>
          </div>
        </div>
      </header>

      <div className="empty-state">
        <Icon icon="mdi:image-multiple-outline" width={48} />
        <p>Galería en construcción</p>
      </div>
    </div>
  );
}
